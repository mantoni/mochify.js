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
var which     = require('which');

module.exports = function (b, opts) {

  var done;
  var input;
  var output;

  /**
   * Finds global or local PhantomJS installation and uses its executable
   * filepath.
   * Overridden by opts.phantomjs.
   * @returns {(string|undefined)} Path to PhantomJS executable, if present
   */
  function findPhantomJS() {
    var filepath;

    if (opts.phantomjs) {
      return opts.phantomjs;
    }

    try {
      filepath = which.sync('phantomjs');
    } catch (e) {
      // ignored
      try {
        filepath = require.resolve('phantomjs/bin/phantomjs');
      } catch (ignore) {
        // ignored
      }
    }
    return filepath;
  }

  function launch() {
    var phantomPath = findPhantomJS();
    input  = through();
    output = phantomic(input, {
      debug          : opts.debug,
      port           : opts.port,
      brout          : true,
      phantomjs      : phantomPath,
      'web-security' : opts['web-security'],
      'ignore-ssl-errors': opts['ignore-ssl-errors']
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
      if (input) {
        input.write(chunk);
      }
      next();
    }, function (next) {
      if (opts.reporter !== 'xunit') {
        opts.output.write('# phantomjs:\n');
      }
      done = next;
      if (input) {
        input.end();
      }
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
