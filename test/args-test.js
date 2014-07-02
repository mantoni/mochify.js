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
var args   = require('../lib/args');
var run    = require('./fixture/run');


describe('args', function () {

  it('sets defaults', function () {
    var opts = args([]);

    assert.equal(opts.watch, false);
    assert.equal(opts.cover, false);
    assert.equal(opts.node, false);
    assert.equal(opts.wd, false);
    assert.equal(opts.reporter, 'dot');
    assert.equal(opts.timeout, 2000);
    assert.equal(opts.port, 0);
    assert.equal(opts.yields, 0);
  });

  it('parses --reporter', function () {
    var opts = args(['--reporter', 'tap']);

    assert.equal(opts.reporter, 'tap');
  });

  it('parses -R', function () {
    var opts = args(['-R', 'tap']);

    assert.equal(opts.reporter, 'tap');
  });

  it('parses --timeout', function () {
    var opts = args(['--timeout', '3000']);

    assert.equal(opts.timeout, 3000);
  });

  it('parses -t', function () {
    var opts = args(['-t', '3000']);

    assert.equal(opts.timeout, 3000);
  });

  it('parses --ui', function () {
    var opts = args(['--ui', 'TDD']);

    assert.equal(opts.ui, 'TDD');
  });

  it('parses -U', function () {
    var opts = args(['-U', 'TDD']);

    assert.equal(opts.ui, 'TDD');
  });

  it('parses --watch', function () {
    var opts = args(['--watch']);

    assert(opts.watch);
  });

  it('parses -w', function () {
    var opts = args(['-w']);

    assert(opts.watch);
  });

  it('parses --node', function () {
    var opts = args(['--node']);

    assert(opts.node);
  });

  it('parses --wd', function () {
    var opts = args(['--wd']);

    assert(opts.wd);
  });

  it('parses --port', function () {
    var opts = args(['--port', '8765']);

    assert.equal(opts.port, 8765);
  });

  it('parses --yields', function () {
    var opts = args(['--yields', '123']);

    assert.equal(opts.yields, 123);
  });

  it('parses -y', function () {
    var opts = args(['-y', '123']);

    assert.equal(opts.yields, 123);
  });

  it('parses --phantomjs', function () {
    var opts = args(['--phantomjs', '/foo/bar']);

    assert.equal(opts.phantomjs, '/foo/bar');
  });

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
