/*global describe, it*/
'use strict';

describe('test', function () {
  it('fails synchronously', function () {
    throw new Error('Oh noes!');
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

  // It is important to end this test suite with an asynchronous and passing
  // test, so we know mochify will continue running the suite in case previous
  // tests have failed. A synchronous test would not work here as mochify might
  // decide to defer a premature exit until the next tick, which would
  // inadvertently enable synchronous tests to finish beforehand.
  it('passes asynchronously', function (done) {
    setTimeout(function () {
      done();
    }, 50);
  });
});
