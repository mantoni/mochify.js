/*global describe, it, beforeEach*/
/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var assert  = require('assert');
var through = require('through2');
var api     = require('./fixture/api');
var mochify = require('../lib/mochify');


describe('api', function () {
  this.timeout(10000);

  function validateOutput(expect, done) {
    return function (err, buf) {
      if (err) {
        done(err);
        return;
      }
      assert.equal(String(buf), expect);
      done();
    };
  }

  it('runs phantomjs', function (done) {
    mochify('./test/fixture/passes/test/*.js', {
      output   : through(),
      reporter : 'tap'
    }).bundle(validateOutput('1..1\n'
      + 'ok 1 test passes\n'
      + '# tests 1\n'
      + '# pass 1\n'
      + '# fail 0\n', done));
  });

  it('runs node', function (done) {
    mochify('./test/fixture/passes/test/*.js', {
      output   : through(),
      reporter : 'tap',
      node     : true
    }).bundle(validateOutput('1..1\n'
      + 'ok 1 test passes\n'
      + '# tests 1\n'
      + '# pass 1\n'
      + '# fail 0\n', done));
  });

  it('uses defaults', function (done) {
    api('api-defaults.js', function (code, stdout) {
      assert.equal(code, 0);
      assert.equal(stdout.split('\n')[0], '# phantomjs:');
      done();
    });
  });

  it('uses only path', function (done) {
    api('api-only-path.js', function (code, stdout) {
      assert.equal(code, 0);
      assert.equal(stdout.split('\n')[0], '# phantomjs:');
      done();
    });
  });

  it('uses only options', function (done) {
    api('api-only-options.js', function (code, stdout) {
      assert.equal(code, 0);
      assert.equal(stdout.split('\n')[0], '# node:');
      done();
    });
  });

  it('uses only callback', function (done) {
    api('api-only-callback.js', function (code) {
      assert.equal(code, 42);
      done();
    });
  });

  it('uses options and callback', function (done) {
    api('api-options-callback.js', function (code, stdout) {
      assert.equal(code, 42);
      assert.equal(stdout.split('\n')[0], '# node:');
      done();
    });
  });

});
