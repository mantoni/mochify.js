/*global describe, it*/
'use strict';

describe('test', function () {
  it('passes asynchronously', function (done) {
    setTimeout(function () {
      done();
    }, 50);
  });

  // eslint-disable-next-line no-unused-vars
  it('fails asynchronously', function (done) {
    setTimeout(function () {
      throw new Error('Oh noes!');
    }, 50);
  });

  it('passes synchronously', function () {
    return;
  });
});
