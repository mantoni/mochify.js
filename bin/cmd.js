#!/usr/bin/env node
/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var browserify = require('browserify');
var watchify   = require('watchify');
var coverify   = require('coverify');
var mocaccino  = require('mocaccino');
var webdriver  = require('min-wd');
var args       = require('../lib/args');
var cover      = require('../lib/cover');
var node       = require('../lib/node');
var phantom    = require('../lib/phantom');
var consolify  = require('../lib/consolify');

var opts = args(process.argv.slice(2));

function error(err) {
  console.error(String(err) + '\n');
  if (!opts.watch) {
    process.nextTick(function () {
      process.exit(1);
    });
  }
}


var brOpts = {
  debug        : true,
  cache        : {},
  packageCache : {},
  extensions   : []
};
if (opts.node) {
  brOpts.builtins = false;
  brOpts.commondir = false;
  brOpts.detectGlobals = false;
  brOpts.insertGlobalVars = ['__dirname', '__filename'];
}
opts.extensions.forEach(function(ext) {
  brOpts.extensions.push("." + ext);
});

var b = browserify(brOpts);
if (opts.consolify) {
  b.plugin(consolify, opts);
} else if (opts.node) {
  b.plugin(node, opts);
} else if (opts.wd) {
  b.plugin(webdriver, { timeout : 0 });
} else {
  b.plugin(phantom, opts);
}
if (opts.cover) {
  b.transform(coverify);
  b.plugin(cover);
}

opts.entries.forEach(function (entry) {
  b.add(entry);
});

b.plugin(mocaccino, {
  reporter : opts.reporter,
  ui       : opts.ui,
  node     : opts.node,
  yields   : opts.yields,
  timeout  : opts.timeout
});

b.on('error', error);
b.on('bundle', function (out) {
  out.on('error', function (err) {
    console.error(String(err) + '\n');
  });
  out.pipe(process.stdout);
});

if (opts.watch) {
  var w = watchify(b);
  var bundling = false;
  var queued = false;

  var bundle = function () {
    if (!bundling) {
      bundling = true;
      b.bundle();
    } else {
      queued = true;
    }
  };
  w.on('update', bundle);
  b.on('bundle', function (out) {
    out.on('end', function () {
      bundling = false;
      if (queued) {
        queued = false;
        setImmediate(bundle);
      }
    });
  });

  process.on('SIGINT', function () {
    w.close();
    setTimeout(function () {
      process.exit(0);
    }, 50);
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
}

b.bundle();
