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


describe('node', function () {

  it('passes', function (done) {
    run('passes', ['--node', '-R', 'tap'], function (code, stdout) {
      assert.equal(stdout, '1..1\n'
        + 'ok 1 test passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('fails', function (done) {
    run('fails', ['--node', '-R', 'tap'], function (code, stdout) {
      assert.equal(stdout.indexOf('1..1\n'
        + 'not ok 1 test fails\n'
        + '  Error: Oh noes!'), 0);
      assert.equal(code, 1);
      done();
    });
  });

  it('coverage tap', function (done) {
    run('passes', ['--node', '--cover', '-R', 'tap'], function (code, stdout) {
      assert.equal(stdout, '1..1\n'
        + 'ok 1 test passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n\n# coverage: 8/8 (100.00 %)\n\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('coverage dot', function (done) {
    run('passes', ['--node', '--cover'], function (code, stdout) {
      var lines = stdout.trim().split(/\n+/);
      assert.equal(lines[0], '\u001b[90m․\u001b[0m');
      assert.equal(lines[2], '# coverage: 8/8 (100.00 %)');
      assert.equal(code, 0);
      done();
    });
  });

  it('fails if test fails but coverage is fine', function (done) {
    run('fails', ['--node', '--cover', '-R', 'tap'], function (code) {
      assert.equal(code, 1);
      done();
    });
  });

  it('fails cover', function (done) {
    run('fails-cover', ['--node', '--cover', '-R', 'tap'],
      function (code, stdout) {
        var testOut = '1..1\n'
          + 'ok 1 test does not cover\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n';
        var coverOut = '\n# coverage: 9/10 (90.00 %)\n\n';
        assert.equal(stdout.substring(0, testOut.length), testOut);
        assert.equal(stdout.substring(stdout.length - coverOut.length),
            coverOut);
        assert.equal(code, 1);
        done();
      });
  });

  it('times out', function (done) {
    run('timeout', ['--node', '-R', 'tap', '--timeout', '10'],
      function (code, stdout) {
        assert.equal(stdout.indexOf('1..1\n'
          + 'not ok 1 test times out\n'), 0);
        assert.equal(code, 1);
        done();
      });
  });

  it('uses tdd ui', function (done) {
    run('ui-tdd', ['--node', '-R', 'tap', '--ui', 'tdd'],
      function (code, stdout) {
        assert.equal(stdout, '1..1\n'
          + 'ok 1 test passes\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n');
        assert.equal(code, 0);
        done();
      });
  });

});
