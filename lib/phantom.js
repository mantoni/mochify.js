/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var through   = require('through2');
var phantomic = require('phantomic');
var trace     = require('./trace');

module.exports = function (b, opts) {

  var done;
  var input;
  var output;
  function launch() {
    input = through(function (chunk, enc, next) {
      /*jslint unparam: true*/
      this.push(chunk);
      next();
    });
    output = phantomic(input, {
      debug     : opts.debug,
      port      : opts.port,
      brout     : true,
      phantomjs : opts.phantomjs
    }, function (code) {
      if (code) {
        b.emit('error', new Error('Exit ' + code));
      }
      if (done) {
        done();
        done = null;
        output = null;
        if (opts.watch) {
          launch();
        }
      }
    });
  }

  launch();

  function apply() {
    var wrap = b.pipeline.get('wrap');

    wrap.push(through(function (chunk, enc, next) {
      /*jslint unparam: true*/
      input.write(chunk);
      next();
    }, function (next) {
      done = next;
      input.end();
    }));

    wrap.push(output.pipe(trace()));
  }

  apply();
  b.on('reset', apply);

};
