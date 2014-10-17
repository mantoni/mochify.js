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


describe('stack', function () {
  this.timeout(3000);

  it('does not screw up xunit', function (done) {
    run('passes', ['-R', 'xunit'], function (code, stdout) {
      var lines = stdout.split('\n');
      var expect = '<testcase classname="test" name="passes" time="0';
      assert.equal(lines[1].substring(0, expect.length), expect);
      assert.equal(lines[2], '</testsuite>');
      assert.equal(code, 0);
      done();
    });
  });

});
