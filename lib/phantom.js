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
    input  = through();
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
      if (opts.reporter !== 'xunit') {
        opts.output.write('# phantomjs:\n');
      }
      done = next;
      input.end();
    }));

    wrap.push(output.pipe(trace()));
  }

  apply();
  b.on('reset', apply);
  b.on('bundle', function (bundle) {
    bundle.on('error', function () {
      if (input) {
        input.end();
        input = null;
        if (opts.watch) {
          launch();
        }
      }
    });
  });

};
