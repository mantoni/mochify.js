#!/usr/bin/env node
/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var watchify   = require('watchify');
var browserify = require('browserify');
var coverify   = require('coverify');
var through    = require('through');
var resolve    = require('resolve');
var path       = require('path');
var mocaccino  = require('mocaccino');
var args       = require('../lib/args');
var cover      = require('../lib/cover');
var launch     = require('../lib/launch');

var opts    = args(process.argv.slice(2));
var cwd     = process.cwd();
var context = {
  failure : false,
  ps      : null
};

function error(err) {
  console.error(String(err) + '\n');
  if (!opts.watch) {
    process.nextTick(function () {
      process.exit(1);
    });
  }
}

function launcherOut() {
  if (opts.cover) {
    return cover(function (code) {
      if (!opts.watch) {
        process.nextTick(function () {
          process.exit(context.failure || code);
        });
      }
    });
  }
  return process.stdout;
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
  wb.pipe(context.ps);
}

function bundler(w, launcher) {
  (function run() {
    context.ps = through();
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
  yields   : opts.yields,
  timeout  : opts.timeout
});
if (opts.cover) {
  b.transform(coverify);
}
b.on('error', error);


var launcher = launch(context, opts, launcherOut);

if (opts.watch) {

  var w = watchify(b);

  var bundle = bundler(w, launcher);
  w.on('update', bundle);
  w.on('error', error);
  bundle();

  process.on('SIGINT', function () {
    if (context.ps) {
      context.ps.on('end', function () {
        process.exit(0);
      });
      context.ps.queue(null);
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

  context.ps = through();
  launcher();
  browserifyBundle(b);

}
