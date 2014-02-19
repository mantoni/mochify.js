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
var through       = require('through');
var resolve       = require('resolve');
var glob          = require('glob');
var mocaccino     = require('mocaccino');
var phantomic     = require('phantomic');
var webdriver     = require('min-wd/lib/driver');
var webdriverOpts = require('min-wd/lib/options');

var argv     = process.argv.slice(2);
var reporter = 'dot';
var watch    = false;
var wd       = false;
var ps;

if (argv[0] === '--watch') {
  argv.shift();
  watch    = true;
  reporter = 'min';
}

while (argv.length && argv[0].indexOf('-') === 0) {
  if (argv[0] === '--wd') {
    argv.shift();
    wd = true;
  } else if (argv[0] === '--reporter' || argv[0] === '-R') {
    argv.shift();
    reporter = argv.shift();
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

var opts = { entries : entries };

function error(err) {
  console.error(String(err));
}

function launcherCallback(callback) {
  return function (err) {
    if (!watch) {
      process.nextTick(function () {
        process.exit(err ? 1 : 0);
      });
    } else if (callback) {
      callback();
    }
  };
}

function launchPhantom(callback) {
  phantomic(ps, launcherCallback(callback)).pipe(process.stdout);
}

function launchWebDriver(callback) {
  webdriver(ps, webdriverOpts(),
      launcherCallback(callback)).pipe(process.stdout);
}

function browserifyBundle(w) {
  var wb = w.bundle({
    debug : true
  });
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

function configure(b) {
  if (wd) {
    var minWebDriverFile = resolve.sync('min-wd', {
      baseDir: __dirname,
      packageFilter: function (pkg) {
        return { main : pkg.browser };
      }
    });
    b.add(minWebDriverFile);
  }

  b.plugin(mocaccino, { reporter : reporter });
  entries.forEach(function (entry) {
    b.add(entry);
  });
  b.on('error', error);
}

if (watch) {

  var w = watchify();
  configure(w);

  var bundle = bundler(w, wd ? launchWebDriver : launchPhantom);
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

  var b = browserify();
  configure(b);

  ps = through();
  if (wd) {
    launchWebDriver();
  } else {
    launchPhantom();
  }

  browserifyBundle(b);

}
