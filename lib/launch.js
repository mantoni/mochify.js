/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var path          = require('path');
var spawn         = require('child_process').spawn;
var through       = require('through');
var phantomic     = require('phantomic');
var webdriver     = require('min-wd/lib/driver');
var webdriverOpts = require('min-wd/lib/options');

var TRACE_RE  = /^\s+at [^:]+:[0-9]+\)?\s*$/;
var IGNORE_RE = /\/node_modules\/(browserify|mocha)\//;
var SOURCE_RE = /\/[^:]+/;

var cwd = process.cwd();

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


module.exports = function (context, opts, out) {

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

  function launchNode(callback) {
    var n = spawn('node');
    n.stdout.pipe(tracebackFormatter()).pipe(out());
    n.stderr.pipe(tracebackFormatter()).pipe(process.stderr);
    n.on('exit', function (code) {
      context.failure = code;
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
    context.ps.pipe(n.stdin);
  }

  function launchPhantom(callback) {
    phantomic(context.ps, {
      debug     : opts.debug,
      port      : opts.port,
      brout     : true,
      phantomjs : opts.phantomjs
    }, launcherCallback(callback))
      .pipe(tracebackFormatter())
      .pipe(out());
  }

  function launchWebDriver(callback) {
    var wdOpts = webdriverOpts();
    if (!wdOpts.hasOwnProperty('timeout')) {
      wdOpts.timeout = 0;
    }
    webdriver(context.ps, wdOpts, launcherCallback(callback))
      .pipe(tracebackFormatter())
      .pipe(out());
  }

  if (opts.wd) {
    return launchWebDriver;
  }
  if (opts.node) {
    return launchNode;
  }
  return launchPhantom;
};
