'use strict';

const path = require('path');
const { assert } = require('@sinonjs/referee-sinon');
const execa = require('execa');

describe('playwright', () => {
  it('passes', async () => {
    const result = await execa(
      '../../index.js',
      [
        '--driver',
        'playwright',
        '--driver-option.engine',
        'chromium',
        'passes.js'
      ],
      {
        cwd: path.join(__dirname, 'fixture')
      }
    );

    assert.isFalse(result.failed);
    const json = JSON.parse(result.stdout);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test passes');
  });

  it('fails', async () => {
    let result;
    try {
      result = await execa(
        '../../index.js',
        [
          '--driver',
          'playwright',
          '--driver-option.engine',
          'chromium',
          'fails.js'
        ],
        {
          cwd: path.join(__dirname, 'fixture')
        }
      );
    } catch (error) {
      result = error;
    }

    assert.isTrue(result.failed);
    const json = JSON.parse(result.stdout);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test fails');
  });
});
