'use strict';

const { assert, match, sinon } = require('@sinonjs/referee-sinon');
const { mochify } = require('..');

describe('bundle', () => {
  it('runs command result', async () => {
    sinon.replace(process.stdout, 'write', sinon.fake());

    await mochify({
      driver: 'jsdom',
      reporter: 'json',
      files: [],
      bundle: 'echo \'it("works", function(){});\''
    });
    const output = process.stdout.write.firstCall.args[0];
    sinon.restore(); // Restore sandbox here or test output breaks

    const json = JSON.parse(output);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].title, 'works');
  });

  it('fails with error from command', async () => {
    const promise = mochify({
      driver: 'jsdom',
      files: [],
      bundle: 'false'
    });

    await assert.rejects(
      promise,
      match({
        name: 'Error',
        message: 'Command failed with exit code 1: false'
      })
    );
  });
});
