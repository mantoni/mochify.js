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
var mocaccino     = require('mocaccino');
var phantomic     = require('phantomic');
var webdriver     = require('min-wd/lib/driver');
var webdriverOpts = require('min-wd/lib/options');
var spawn         = require('child_process').spawn;

var argv     = process.argv.slice(2);
var reporter = 'spec';
var watch    = false;
var wd       = false;
var cover    = false;
var node     = false;
var failure  = false;
var ps;

while (argv.length && argv[0].indexOf('-') === 0) {
  if (argv[0] === '--watch') {
    argv.shift();
    watch = true;
  } else if (argv[0] === '--cover') {
    argv.shift();
    cover = true;
  } else if (argv[0] === '--node') {
    argv.shift();
    node = true;
  } else if (argv[0] === '--wd') {
    argv.shift();
    wd = true;
  } else if (argv[0] === '--reporter' || argv[0] === '-R') {
    argv.shift();
    reporter = argv.shift();
  } else if (argv[0] === '--help' || argv[0] === '-h') {
    argv.shift();
    console.log(
      require('fs').readFileSync(require.resolve('./help.txt'), 'utf8')
    );
    process.exit(0);
  } else if (argv[0] === '--version' || argv[0] === '-v') {
    argv.shift();
    console.log(require('../package.json').version);
    process.exit(0);
  } else {
    process.stdout.write('Unknown argument: ' + argv[0] + '\n\n');
    process.exit(1);
  }
}

var entries = [];
if (argv.length) {
  argv.forEach(function (arg) {
    if (arg.indexOf('*') === -1) {
      entries.push(arg);
    } else {
      Array.prototype.push.apply(entries, glob.sync(arg));
    }
  });
} else {
  entries = glob.sync("./test/*.js");
}

function error(err) {
  console.error(String(err));
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
    return c.stdin;
  }
  return process.stdout;
}

function launchNode(callback) {
  var n = spawn('node');
  n.stdout.pipe(launcherOut());
  n.stderr.pipe(process.stderr);
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
  phantomic(ps, launcherCallback(callback)).pipe(launcherOut());
}

function launchWebDriver(callback) {
  var wdOpts = webdriverOpts();
  webdriver(ps, wdOpts, launcherCallback(callback)).pipe(launcherOut());
}

function browserifyBundle(w) {
  var opts = {
    debug : true
  };
  if (node) {
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
  b.add(minWebDriverFile);
}

entries.forEach(function (entry) {
  b.add(entry);
});
b.plugin(mocaccino, { reporter : reporter, node : node });
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
