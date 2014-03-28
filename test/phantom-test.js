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
  this.timeout(3000);

  it('passes', function (done) {
    run('passes', ['-R', 'tap'], function (code, stdout) {
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
    run('fails', ['-R', 'tap'], function (code, stdout) {
      assert.equal(stdout.indexOf('1..1\n'
        + 'not ok 1 test fails\n'
        + '  Error: Oh noes!\n'
        + '      at test/fails.js:7'), 0);
      assert.equal(code, 1);
      done();
    });
  });

  it('coverage', function (done) {
    run('passes', ['--cover', '-R', 'tap'], function (code, stdout) {
      assert.equal(stdout, '1..1\n'
        + 'ok 1 test passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n\n# coverage: 8/8 (100.00 %)\n\n');
      assert.equal(code, 0);
      done();
    });
  });

});
