/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var path    = require('path');
var through = require('through2');


var TRACE_RE  = /^\s+at .+:[0-9]+/;
var IGNORE_RE = /node_modules\/(browserify|browser\-pack|mocha|mocaccino)\//;
var SOURCE_RE = /([ \(])(?:[A-Z]\:)?(\/[^:]+)/;

var cwd = process.cwd();

function relativePath(_, prefix, source) {
  /*jslint unparam: true*/
  return prefix + path.relative(cwd, source);
}

function tracebackFormatter() {
  var buf = '';
  return through(function (chunk, enc, next) {
    /*jslint unparam: true*/
    buf += chunk;
    var l, p = buf.indexOf('\n');
    var w = '';
    while (p !== -1) {
      l = buf.substring(0, p);
      if (TRACE_RE.test(l)) {
        if (!IGNORE_RE.test(l)) {
          l = l.replace(SOURCE_RE, relativePath);
          w += l + '\n';
        }
      } else {
        w += l + '\n';
      }
      buf = buf.substring(p + 1);
      p = buf.indexOf('\n');
    }
    if (!/^\s+/.test(buf) || (buf.length > 3 && !/^\s+at /.test(buf))) {
      w += buf;
      buf = '';
    }
    if (w) {
      this.push(w);
    }
    next();
  });
}

module.exports = tracebackFormatter;
