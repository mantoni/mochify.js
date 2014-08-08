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

  function apply() {
    var input = through(function (chunk, enc, next) {
      /*jslint unparam: true*/
      this.push(chunk);
      next();
    });
    var output = phantomic(input, {
      debug     : opts.debug,
      port      : opts.port,
      brout     : true,
      phantomjs : opts.phantomjs
    }, function (code) {
      if (code) {
        b.emit('error', new Error('Exit ' + code));
      }
    });

    output.pipe(trace()).pipe(process.stdout);

    b.pipeline.get('wrap').push(through(function (chunk, enc, next) {
      /*jslint unparam: true*/
      input.write(chunk);
      next();
    }, function (next) {
      input.end();
      next();
    }));
  }

  apply();
  b.on('reset', apply);

};
