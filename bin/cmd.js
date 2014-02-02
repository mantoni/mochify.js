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
var glob          = require('glob');
var mocaccino     = require('mocaccino');
var phantomic     = require('phantomic');
var webdriver     = require('min-wd/lib/driver');
var webdriverOpts = require('min-wd/lib/options');

var argv     = process.argv.slice(2);
var reporter = 'dot';
var watch    = false;
var wd       = false;

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

function launcherCallback(err) {
  if (!watch) {
    process.nextTick(function () {
      process.exit(err ? 1 : 0);
    });
  }
}

function launchPhantom(ps) {
  phantomic(ps, launcherCallback);
}

function launchWebDriver(ps) {
  webdriver(ps, webdriverOpts(), launcherCallback).pipe(process.stdout);
}

function browserifyBundle(w, ps, callback) {
  var wb = w.bundle({
    debug : true
  });
  wb.on('error', error);
  var ms = mocaccino(wb, { reporter : reporter, browser : true });
  ms.pipe(ps);
  if (callback) {
    ps.on('end', callback);
  }
}

function bundler(w, launcher) {
  var ps = through();
  launcher(ps);
  return function () {
    browserifyBundle(w, ps, function () {
      ps = through();
      launcher(ps);
    });
  };
}

var transform = wd ? 'min-wd' : 'brout';

if (watch) {

  var w = watchify(opts);
  var bundle = bundler(w, wd ? launchWebDriver : launchPhantom);
  w.transform(transform);
  w.on('update', bundle);
  w.on('error', error);
  bundle();

} else {

  var b = browserify(opts);
  b.transform(transform);
  b.on('error', error);

  var ps = through();
  if (wd) {
    launchWebDriver(ps);
  } else {
    launchPhantom(ps);
  }

  browserifyBundle(b, ps);

}
