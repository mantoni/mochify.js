'use strict';

const path = require('path');
const { assert } = require('@sinonjs/referee-sinon');
const execa = require('execa');

describe('playwright', () => {
  async function run(file, ...extra_args) {
    try {
      return await execa(
        '../../index.js',
        [
          file,
          '--driver',
          'playwright',
          '--driver-option.engine',
          'firefox',
          ...extra_args
        ],
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

  it('handles esm', async () => {
    // `.` is passed to serve instead of `fixture` as run offsets process.cwd
    const result = await run('esm.test.js', '--esm', '--serve', '.');
    assert.isFalse(result.failed);
    const json = JSON.parse(result.stdout);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test passes');
  });
});
