/*eslint-env mocha*/
'use strict';

describe('test', () => {
  it('does not leak client functions into global scope', () => {
    if (typeof MochifyReporter !== 'undefined') {
      throw new Error('MochifyReporter leaked');
    }
  });
});
