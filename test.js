/*eslint-env mocha*/
'use strict';

describe('test', () => {
  it('passes', () => {
    console.log('Oh, hi!');
  });

  it('skipped');

  it('fails', () => {
    const error = new TypeError('Oh noes!');
    error.expected = 'Test';
    error.actual = 'test';
    error.operator = '==';
    throw error;
  });

  context('nested', () => {
    it('passes as well', () => {});
  });
});
