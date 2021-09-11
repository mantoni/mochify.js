/*eslint-env mocha*/
import ok from './esm.js';

describe('test', () => {
  it('passes', () => {
    if (ok() !== true) {
      throw new Error('Expected ok to return true.');
    }
  });
});
