/*global describe, it*/
/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var assert = require('assert');
var run    = require('./fixture/run');


describe('args', function () {

  it('quites with usage', function (done) {
    run('passes', ['--unknown'], function (code, stdout) {
      assert.equal(code, 1);
      assert.equal(stdout, 'Unknown argument: --unknown\n'
                   + 'Run `mochify --help` for usage.\n\n');
      done();
    });
  });

});
