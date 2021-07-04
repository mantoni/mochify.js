'use strict';

const { readFile } = require('fs/promises');
const { setupClient } = require('./lib/setup-client');
const { createMochaRunner } = require('./lib/mocha-runner');
const { resolveBundle } = require('./lib/resolve-bundle');
const { run } = require('./lib/run');

exports.mochify = mochify;

async function mochify(config = {}) {
  // Create runner early to verify the reporter exists:
  const mocha_runner = createMochaRunner(config.reporter || 'spec');
  const { mochifyDriver } = resolveMochifyDriver(config.driver);

  const driver_promise = mochifyDriver();
  const bundler_promise = resolveBundle(config.bundle, config.files);

  const [driver, bundle, mocha, client] = await Promise.all([
    driver_promise,
    bundler_promise,
    readFile(require.resolve('mocha/mocha.js'), 'utf8'),
    readFile(require.resolve('./client'), 'utf8')
  ]);

  const configured_client = setupClient(client);
  await driver.evaluate(`${mocha}\n${configured_client}`);

  await run(driver, mocha_runner, bundle);
}

function resolveMochifyDriver(name = 'puppeteer') {
  // eslint-disable-next-line node/global-require
  return require(`@mochify/driver-${name}`);
}
