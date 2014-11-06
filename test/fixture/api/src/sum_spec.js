/*global describe, it*/
// This test that baseSrcPath is set to find sum_func module
'use strict';
var sum = require('sum_func.js');
var assert    = require('assert');

describe('test sum', function () {

  it('should sum 2 + 1', function () {
    assert.equal(sum(2, 1), 3);
  });

});
