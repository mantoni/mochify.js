'use strict';

const path = require('path');
const { assert } = require('@sinonjs/referee-sinon');
const execa = require('execa');

describe('config', () => {
  it('mochify.config.js', async () => {
    const result = await execa('../../index.js', ['passes.js'], {
      cwd: path.join(__dirname, 'fixture'),
      stderr: process.stderr
    });

    const json = JSON.parse(result.stdout);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test passes');
  });

  it('custom.config.yaml', async () => {
    const result = await execa(
      '../../index.js',
      ['--config', 'custom.config.yaml', 'passes.js'],
      {
        cwd: path.join(__dirname, 'fixture'),
        stderr: process.stderr
      }
    );

    assert.match(result.stdout, 'ok 1 test passes');
  });

  it('overrides config with command line option', async () => {
    const result = await execa(
      '../../index.js',
      ['--reporter', 'tap', '--driver', 'jsdom', 'passes.js'],
      {
        cwd: path.join(__dirname, 'fixture'),
        stderr: process.stderr
      }
    );

    assert.match(result.stdout, 'ok 1 test passes');
  });
});
