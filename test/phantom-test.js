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


describe('phantom', function () {
  this.timeout(5000);

  it('passes', function (done) {
    run('passes', ['-R', 'tap'], function (code, stdout) {
      assert.equal(stdout, '# phantomjs:\n'
        + '1..1\n'
        + 'ok 1 test passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('fails', function (done) {
    run('fails', ['-R', 'tap'], function (code, stdout) {
      assert.equal(stdout.indexOf('# phantomjs:\n'
        + '1..1\n'
        + 'not ok 1 test fails\n'
        + '      at test/fails.js:7'), 0);
      assert.equal(code, 1);
      done();
    });
  });

  it('coverage tap', function (done) {
    run('passes', ['--cover', '-R', 'tap'], function (code, stdout) {
      assert.equal(stdout, '# phantomjs:\n'
        + '1..1\n'
        + 'ok 1 test passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n# coverage: 8/8 (100.00 %)\n\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('coverage dot', function (done) {
    run('passes', ['--cover', '--no-colors'], function (code, stdout) {
      var lines = stdout.trim().split(/\n+/);
      assert.equal(lines[0], '# phantomjs:');
      assert.equal(lines[1], '  .');
      assert.equal(lines[3], '# coverage: 8/8 (100.00 %)');
      assert.equal(code, 0);
      done();
    });
  });

  it('times out', function (done) {
    run('timeout', ['-R', 'tap', '--timeout', '10'], function (code, stdout) {
      assert.equal(stdout.indexOf('# phantomjs:\n'
        + '1..1\n'
        + 'not ok 1 test times out\n'), 0);
      assert.equal(code, 1);
      done();
    });
  });

  it('uses tdd ui', function (done) {
    run('ui-tdd', ['-R', 'tap', '--ui', 'tdd'], function (code, stdout) {
      assert.equal(stdout, '# phantomjs:\n'
        + '1..1\n'
        + 'ok 1 test passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('enables color', function (done) {
    run('passes', ['-R', 'dot', '--colors'], function (code, stdout) {
      assert.equal(stdout.trim().split('\n')[3], '  \u001b[90m.\u001b[0m');
      assert.equal(code, 0);
      done();
    });
  });

  it('uses custom phantomjs', function (done) {
    run('passes', ['--phantomjs', 'some/path'], function (code, stdout) {
      assert.equal(stdout.indexOf('Cannot find phantomjs'), 0);
      assert.notEqual(code, 0);
      done();
    });
  });

  it('requires file', function (done) {
    run('passes', ['-R', 'tap', '-r', '../required'], function (code, stdout) {
      assert.equal(stdout.split('\n')[1], 'required');
      assert.equal(code, 0);
      done();
    });
  });

  it('passes recursive', function (done) {
    run('recursive', ['-R', 'tap', '--recursive'], function (code, stdout) {
      assert.equal(stdout, '# phantomjs:\n'
        + '1..1\n'
        + 'ok 1 recursive passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n');
      assert.equal(code, 0);
      done();
    });
  });

});
