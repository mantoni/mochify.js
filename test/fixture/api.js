/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var spawn  = require('child_process').spawn;
var path   = require('path');


function run(test, callback) {
  var mochify = spawn('node', [path.resolve(__dirname, test)], {
    cwd : path.resolve(__dirname, 'api')
  });

  var stdout = '';
  var handle = function (data) {
    stdout += data;
  };
  mochify.stdout.on('data', handle);
  mochify.stderr.on('data', handle);

  mochify.on('close', function (code) {
    callback(code, stdout);
  });
}

module.exports = run;
