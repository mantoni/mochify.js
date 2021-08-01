'use strict';

const { assert, sinon } = require('@sinonjs/referee-sinon');
const { mochify } = require('..');

describe('files', () => {
  it('passes files to bundle command', async () => {
    sinon.replace(process.stdout, 'write', sinon.fake());

    await mochify({
      driver: 'jsdom',
      reporter: 'json',
      files: [`${__dirname}/fixture/passes.js`],
      bundle: 'cat'
    });
    const output = process.stdout.write.firstCall.args[0];
    sinon.restore(); // Restore sandbox here or test output breaks

    const json = JSON.parse(output);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test passes');
  });
});
