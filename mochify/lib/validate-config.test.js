'use strict';

const fs = require('fs');
const { assert } = require('@sinonjs/referee-sinon');
const { validateConfig } = require('./validate-config');

describe('mochify/lib/validate-config', () => {
  it('returns an error when esm and bundle are given', () => {
    assert.isError(
      validateConfig({
        driver: 'puppeteer',
        esm: true,
        bundle: 'browserify',
        spec: './test.js'
      })
    );
  });

  it('returns an error when bundle and a stream spec are given', () => {
    assert.isError(
      validateConfig({
        driver: 'puppeteer',
        bundle: 'browserify',
        spec: fs.createReadStream(__filename)
      })
    );
  });

  it('returns an error on an empty config', () => {
    assert.isError(validateConfig({}));
  });

  it('returns null on a valid config', () => {
    assert.isNull(
      validateConfig({
        bundle: 'browserify -t babelify',
        spec: './test.js',
        driver: 'puppeteer'
      })
    );
  });
});
