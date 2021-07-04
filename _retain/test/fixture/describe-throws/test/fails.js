/*global describe, it*/
'use strict';

describe('other', function () {

  it('prints something', function () {
    // test output is expected not to contain this string
    // as mochify should exit immediately if evaluation throws
    console.log('i should not show up');
  });

});

describe('test', function () {

  throw new Error('Oh noes!');

});
