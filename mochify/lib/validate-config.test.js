'use strict';

const fs = require('fs');
const { assert, refute } = require('@sinonjs/referee-sinon');
const { validateConfig } = require('./validate-config');

describe('mochify/lib/validate-config', () => {
  it('returns an error when esm and bundle are given', () => {
    assert.exception(() => {
      validateConfig({
        driver: 'puppeteer',
        esm: true,
        bundle: 'browserify',
        spec: './test.js'
      });
    });
  });

  it('returns an error when bundle and a stream spec are given', () => {
    assert.exception(() => {
      validateConfig({
        driver: 'puppeteer',
        bundle: 'browserify',
        spec: fs.createReadStream(__filename)
      });
    });
  });

  it('returns an error on an empty config', () => {
    assert.exception(() => validateConfig({}));
  });

  it('returns null on a valid config', () => {
    refute.exception(() => {
      validateConfig({
        bundle: 'browserify -t babelify',
        spec: './test.js',
        driver: 'puppeteer'
      });
    });
  });
});
