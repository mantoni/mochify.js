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
var glob          = require('glob');
var path          = require('path');
var mocaccino     = require('mocaccino');
var phantomic     = require('phantomic');
var webdriver     = require('min-wd/lib/driver');
var webdriverOpts = require('min-wd/lib/options');
var spawn         = require('child_process').spawn;

var argv     = process.argv.slice(2);
var cwd      = process.cwd();
var reporter = 'dot';
var watch    = false;
var wd       = false;
var cover    = false;
var node     = false;
var failure  = false;
var debug    = false;
var port     = 0;
var yields   = 0;
var ps;
var arg;

while (argv.length && argv[0].indexOf('-') === 0) {
  arg = argv[0];
  if (arg === '--watch' || arg === '-w') {
    argv.shift();
    watch = true;
  } else if (arg === '--cover') {
    argv.shift();
    cover = true;
  } else if (arg === '--node') {
    argv.shift();
    node = true;
  } else if (arg === '--wd') {
    argv.shift();
    wd = true;
  } else if (arg === '--reporter' || arg === '-R') {
    argv.shift();
    reporter = argv.shift();
  } else if (arg === '--yields' || arg === '-y') {
    argv.shift();
    yields = parseInt(argv.shift(), 10);
  } else if (arg === '--debug') {
    argv.shift();
    debug = true;
  } else if (arg === '--port') {
    argv.shift();
    port = parseInt(argv.shift(), 10);
  } else if (arg === '--help' || arg === '-h') {
    argv.shift();
    console.log(require('fs').readFileSync(__dirname + '/help.txt', 'utf8'));
    process.exit(0);
  } else if (arg === '--version' || arg === '-v') {
    argv.shift();
    console.log(require('../package.json').version);
    process.exit(0);
  } else {
    console.log('Unknown argument: ' + arg);
    console.log('Run `mochify --help` for usage.\n');
    process.exit(1);
  }
}

if (debug) {
  if (node) {
    console.log('--debug does not work with --node\n');
    process.exit(1);
  }
  if (wd) {
    console.log('--debug does not work with --wd\n');
    process.exit(1);
  }
}

var entries = [];
if (!argv.length) {
  argv = ['./test/*.js'];
}
argv.forEach(function (arg) {
  if (arg.indexOf('*') === -1) {
    entries.push(arg);
  } else {
    Array.prototype.push.apply(entries, glob.sync(arg));
  }
});
if (!entries.length) {
  console.error('Error: Nothing found for "' + argv.join('" or "') + '".\n');
  process.exit(1);
}

function error(err) {
  console.error(String(err) + '\n');
  if (!watch) {
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
    if (!watch && !cover) {
      process.nextTick(function () {
        process.exit(err ? 1 : 0);
      });
    } else if (callback) {
      callback();
    }
  };
}

function launcherOut() {
  if (cover) {
    var c = spawn(resolve.sync('coverify', {
      baseDir: __dirname,
      packageFilter: function (pkg) {
        return { main : pkg.bin.coverify };
      }
    }));
    c.stdout.pipe(process.stdout);
    c.stderr.pipe(process.stderr);
    c.on('exit', function (code) {
      if (!watch) {
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
    if (!watch) {
      if (!cover) {
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
    debug : debug,
    port  : port,
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
  var opts = {
    debug : true
  };
  if (node) {
    opts.detectGlobals = false;
    opts.insertGlobalVars = ['__dirname', '__filename'];
  }
  var wb = w.bundle(opts);
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


var opts = {};
if (node) {
  opts.builtins = false;
  opts.commondir = false;
}
var b = browserify(opts);
if (wd) {
  var minWebDriverFile = resolve.sync('min-wd', {
    baseDir: __dirname,
    packageFilter: function (pkg) {
      return { main : pkg.browser };
    }
  });
  minWebDriverFile = path.relative(process.cwd(), minWebDriverFile);
  minWebDriverFile = "./" + minWebDriverFile.replace(/\\/g, '/');
  b.require(minWebDriverFile, { expose : "min-wd" });
  b.transform(require("min-wd"));
}

entries.forEach(function (entry) {
  b.add(entry);
});
b.plugin(mocaccino, { reporter : reporter, node : node, yields : yields });
if (cover) {
  b.transform(coverify);
}
b.on('error', error);


var launcher = null;
if (wd) {
  launcher = launchWebDriver;
} else if (node) {
  launcher = launchNode;
} else {
  launcher = launchPhantom;
}

if (watch) {

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
