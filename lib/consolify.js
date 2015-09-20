/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var fs        = require('fs');
var through   = require('through2');
var consolify = require('consolify');


module.exports = function (b, opts) {
  consolify(b, {
    bundle: opts.bundle
  });

  function apply() {
    var file = '';
    b.pipeline.get('wrap').push(through(function (chunk, enc, next) {
      /*jslint unparam: true*/
      file += chunk;
      next();
    }, function (next) {
      /*eslint no-sync: 0*/
      fs.writeFileSync(opts.consolify, file);
      if (opts.watch) {
        console.log('Generated ' + opts.consolify);
      }
      next();
    }));
  }

  apply();
  b.on('reset', apply);
};
