#!/usr/bin/env node
/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var watchify      = require('watchify');
var browserify    = require('browserify');
var coverify      = require('coverify');
var through       = require('through');
var resolve       = require('resolve');
var path          = require('path');
var mocaccino     = require('mocaccino');
var phantomic     = require('phantomic');
var webdriver     = require('min-wd/lib/driver');
var webdriverOpts = require('min-wd/lib/options');
var spawn         = require('child_process').spawn;
var args          = require('../lib/args');

var opts    = args.parse(process.argv.slice(2));
var cwd     = process.cwd();
var failure = false;
var ps;

function error(err) {
  console.error(String(err) + '\n');
  if (!opts.watch) {
    process.nextTick(function () {
      process.exit(1);
    });
  }
}

var TRACE_RE  = /^\s+at [^:]+:[0-9]+\)?\s*$/;
var IGNORE_RE = /\/node_modules\/(browserify|mocha)\//;
var SOURCE_RE = /\/[^:]+/;

function relativePath(source) {
  return path.relative(cwd, source);
}

function tracebackFormatter() {
  var buf = '';
  return through(function (chunk) {
    buf += chunk;
    var l, p = buf.indexOf('\n');
    while (p !== -1) {
      l = buf.substring(0, p);
      if (TRACE_RE.test(l)) {
        if (!IGNORE_RE.test(l)) {
          l = l.replace(SOURCE_RE, relativePath);
          this.queue(l + '\n');
        }
      } else {
        this.queue(l + '\n');
      }
      buf = buf.substring(p + 1);
      p = buf.indexOf('\n');
    }
    if (!/^\s+/.test(buf) || (buf.length > 3 && !/^\s+at /.test(buf))) {
      this.queue(buf);
      buf = '';
    }
  });
}

function coverifySplit(coverifyIn) {
  var buf = '';
  return through(function (chunk) {
    var p;
    buf += chunk;
    while (buf.length > 4) {
      p = buf.indexOf('COVER');
      if (p === -1) {
        this.queue(buf.substring(0, buf.length - 5));
        buf = buf.substring(buf.length - 5);
        return;
      }
      if (p !== 0) {
        this.queue(buf.substring(0, p));
        buf = buf.substring(p);
      }
      p = buf.indexOf('\n');
      if (p === -1) {
        return;
      }
      coverifyIn.write(buf.substring(0, p + 1));
      buf = buf.substring(p + 1);
    }
  }, function () {
    if (buf.length) {
      this.queue(buf);
    }
    this.queue(null);
    coverifyIn.end();
  });
}

function launcherCallback(callback) {
  return function (err) {
    if (!opts.watch && !opts.cover) {
      process.nextTick(function () {
        process.exit(err ? 1 : 0);
      });
    } else if (callback) {
      callback();
    }
  };
}

function launcherOut() {
  if (opts.cover) {
    var c = spawn(resolve.sync('coverify', {
      baseDir: __dirname,
      packageFilter: function (pkg) {
        return { main : pkg.bin.coverify };
      }
    }));
    c.stdout.pipe(process.stdout);
    c.stderr.pipe(process.stderr);
    c.on('exit', function (code) {
      if (!opts.watch) {
        process.nextTick(function () {
          process.exit(failure || code);
        });
      }
    });
    var split = coverifySplit(c.stdin);
    split.pipe(process.stdout);
    return split;
  }
  return process.stdout;
}

function launchNode(callback) {
  var n = spawn('node');
  n.stdout.pipe(tracebackFormatter()).pipe(launcherOut());
  n.stderr.pipe(tracebackFormatter()).pipe(process.stderr);
  n.on('exit', function (code) {
    failure = code;
    if (!opts.watch) {
      if (!opts.cover) {
        process.nextTick(function () {
          process.exit(code);
        });
      }
    } else {
      callback();
    }
  });
  ps.pipe(n.stdin);
}

function launchPhantom(callback) {
  phantomic(ps, {
    debug : opts.debug,
    port  : opts.port,
    brout : true
  }, launcherCallback(callback))
    .pipe(tracebackFormatter())
    .pipe(launcherOut());
}

function launchWebDriver(callback) {
  var wdOpts = webdriverOpts();
  if (!wdOpts.hasOwnProperty('timeout')) {
    wdOpts.timeout = 0;
  }
  webdriver(ps, wdOpts, launcherCallback(callback))
    .pipe(tracebackFormatter())
    .pipe(launcherOut());
}

function browserifyBundle(w) {
  var bundleOpts = {
    debug : true
  };
  if (opts.node) {
    bundleOpts.detectGlobals = false;
    bundleOpts.insertGlobalVars = ['__dirname', '__filename'];
  }
  var wb = w.bundle(bundleOpts);
  wb.on('error', error);
  wb.pipe(ps);
}

function bundler(w, launcher) {
  (function run() {
    ps = through();
    launcher(run);
  }());
  return function () {
    browserifyBundle(w);
  };
}


var brOpts = {};
if (opts.node) {
  brOpts.builtins = false;
  brOpts.commondir = false;
}
var b = browserify(brOpts);
if (opts.wd) {
  var minWebDriverFile = resolve.sync('min-wd', {
    baseDir: __dirname,
    packageFilter: function (pkg) {
      return { main : pkg.browser };
    }
  });
  minWebDriverFile = path.relative(cwd, minWebDriverFile);
  minWebDriverFile = "./" + minWebDriverFile.replace(/\\/g, '/');
  b.require(minWebDriverFile, { expose : "min-wd" });
  b.transform(require("min-wd"));
}

opts.entries.forEach(function (entry) {
  b.add(entry);
});
b.plugin(mocaccino, {
  reporter : opts.reporter,
  node     : opts.node,
  yields   : opts.yields
});
if (opts.cover) {
  b.transform(coverify);
}
b.on('error', error);


var launcher = null;
if (opts.wd) {
  launcher = launchWebDriver;
} else if (opts.node) {
  launcher = launchNode;
} else {
  launcher = launchPhantom;
}

if (opts.watch) {

  var w = watchify(b);

  var bundle = bundler(w, launcher);
  w.on('update', bundle);
  w.on('error', error);
  bundle();

  process.on('SIGINT', function () {
    if (ps) {
      ps.on('end', function () {
        process.exit(0);
      });
      ps.queue(null);
    } else {
      process.exit(0);
    }
  });

  // Hack for Windows:
  if (require('os').platform() === 'win32') {
    var readline = require('readline');
    var rl = readline.createInterface({
      input  : process.stdin,
      output : process.stdout
    });
    rl.on('SIGINT', function () {
      process.emit('SIGINT');
    });
  }

} else {

  ps = through();
  launcher();
  browserifyBundle(b);

}
