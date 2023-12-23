'use strict';

const fs = require('fs');
const path = require('path');
const { assert } = require('@sinonjs/referee-sinon');
const execa = require('execa');

/**
 * @typedef {import('execa').ExecaError} ExecaError
 */

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
          cwd: path.join(__dirname, 'fixture'),
          stderr: process.stderr
        }
      );
    } catch (error) {
      return /** @type {ExecaError} */ (error);
    }
  }

  it('passes', async () => {
    const result = await run('passes.js');

    assert.isFalse(result.failed);
    const json = JSON.parse(result.stdout);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test passes');
  });

  it('reads from stdin', async () => {
    let result;
    try {
      const cp = execa(
        '../../index.js',
        ['--driver', 'playwright', '--driver-option.engine', 'firefox', '-'],
        {
          cwd: path.join(__dirname, 'fixture')
        }
      );
      const fixture = fs.createReadStream(
        path.resolve(__dirname, './fixture/passes.js')
      );
      fixture.pipe(/** @type {Object} */ (cp).stdin);
      result = await cp;
    } catch (err) {
      result = /** @type {ExecaError} */ (err);
    }

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
    const result = await run('esm.test.js', '--esm');
    assert.isFalse(result.failed);
    const json = JSON.parse(result.stdout);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test passes');
  });
});
