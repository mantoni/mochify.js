/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var path    = require('path');
var through = require('through');


var TRACE_RE  = /^\s+at .+:[0-9]+/;
var IGNORE_RE = /\/node_modules\/(browserify|mocha|mocaccino)\//;
var SOURCE_RE = /([ \(])(?:[A-Z]\:)?(\/[^:]+)/;

var cwd = process.cwd();

function relativePath(_, prefix, source) {
  /*jslint unparam: true*/
  return prefix + path.relative(cwd, source);
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

module.exports = tracebackFormatter;
