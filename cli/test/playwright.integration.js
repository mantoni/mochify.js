'use strict';

const path = require('path');
const { assert } = require('@sinonjs/referee-sinon');
const execa = require('execa');

describe('playwright', () => {
  async function run(file) {
    try {
      return await execa(
        '../../index.js',
        ['--driver', 'playwright', '--driver-option.engine', 'chromium', file],
        {
          cwd: path.join(__dirname, 'fixture')
        }
      );
    } catch (error) {
      return error;
    }
  }

  it('passes', async () => {
    const result = await run('passes.js');

    assert.isFalse(result.failed);
    const json = JSON.parse(result.stdout);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test passes');
  });

  it('fails', async () => {
    const result = await run('fails.js');

    assert.isTrue(result.failed);
    const json = JSON.parse(result.stdout);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test fails');
  });

  it('does not leak client functions into global scope', async () => {
    const result = await run('client-leak.js');

    assert.isFalse(result.failed);
    const json = JSON.parse(result.stdout);
    assert.equals(json.tests.length, 1);
    assert.equals(
      json.tests[0].fullTitle,
      'test does not leak client functions into global scope'
    );
  });
});
