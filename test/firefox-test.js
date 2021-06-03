/*eslint-env mocha*/
/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var assert = require('assert');
var run = require('./fixture/run');

describe('firefox', function () {
  this.timeout(8000);

  it('passes', function (done) {
    run('passes', ['-R', 'tap', '-e', 'firefox'], function (code, stdout) {
      assert.equal(stdout, '# firefox:\n'
        + 'ok 1 test passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n'
        + '1..1\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('coverage tap', function (done) {
    run('passes', ['--cover', '-R', 'tap', '-e', 'firefox'],
      function (code, stdout, stderr) {
        assert.equal(stdout, '# firefox:\n'
          + 'ok 1 test passes\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n'
          + '1..1\n');
        assert.equal(stderr, '# coverage: 8/8 (100.00 %)\n\n');
        assert.equal(code, 0);
        done();
      });
  });

  it('coverage dot', function (done) {
    run('passes', ['--cover', '--no-colors', '-R', 'dot', '-e', 'firefox'],
      function (code, stdout, stderr) {
        var lines = stdout.trim().split(/\n+/);
        assert.equal(lines[0], '# firefox:');
        assert.equal(lines[1], '  .');
        assert.equal(stderr, '# coverage: 8/8 (100.00 %)\n\n');
        assert.equal(code, 0);
        done();
      });
  });

  it('times out', function (done) {
    run('timeout', ['-R', 'tap', '--timeout', '10', '-e', 'firefox'],
      function (code, stdout) {
        var lines = stdout.trim().split(/\n+/);
        assert.equal(lines[0], '# firefox:');
        assert.equal(lines[1], 'not ok 1 test times out');
        assert.equal(lines[lines.length - 1], '1..1');
        assert.equal(code, 1);
        done();
      });
  });

  it('uses tdd ui', function (done) {
    run('ui-tdd', ['-R', 'tap', '--ui', 'tdd', '-e', 'firefox'],
      function (code, stdout) {
        assert.equal(stdout, '# firefox:\n'
          + 'ok 1 test passes\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n'
          + '1..1\n');
        assert.equal(code, 0);
        done();
      });
  });
});
