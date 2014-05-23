/*global describe, it, after*/
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

  it('quits with usage', function (done) {
    run('passes', ['--unknown'], function (code, stdout) {
      assert.equal(code, 1);
      assert.equal(stdout, 'Unknown argument: --unknown\n'
                   + 'Run `mochify --help` for usage.\n\n');
      done();
    });
  });

  it('requires single glob to match', function (done) {
    run('passes', ['./unknown/*'], function (code, stdout) {
      assert.equal(code, 1);
      assert.equal(stdout, 'Error: Nothing found for "./unknown/*".\n\n');
      done();
    });
  });

  it('requires multiple globs to match', function (done) {
    run('passes', ['./thing-a/*', './thing-b/*'], function (code, stdout) {
      assert.equal(code, 1);
      assert.equal(stdout,
          'Error: Nothing found for "./thing-a/*" or "./thing-b/*".\n\n');
      done();
    });
  });

  it('fails with meaningful message if file is missing', function (done) {
    run('passes', ['./unknown-file.js'], function (code, stdout) {
      assert.equal(code, 1);
      assert(stdout.indexOf('./unknown-file.js') !== -1);
      done();
    });
  });

  it('fails with meaningful message for defaults', function (done) {
    run('.', [], function (code, stdout) {
      assert.equal(code, 1);
      assert.equal(stdout, 'Error: Nothing found for "./test/*.js".\n\n');
      done();
    });
  });

});
