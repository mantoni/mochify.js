'use strict';

const { readFile } = require('fs/promises');
const { loadConfig } = require('./lib/load-config');
const { setupClient } = require('./lib/setup-client');
const { createMochaRunner } = require('./lib/mocha-runner');
const { resolveBundle } = require('./lib/resolve-bundle');
const { startServer } = require('./lib/server');
const { run } = require('./lib/run');

exports.mochify = mochify;

async function mochify(options = {}) {
  const config = await loadConfig(options);

  // Create runner early to verify the reporter exists:
  const mocha_runner = createMochaRunner(config.reporter || 'spec');
  const { mochifyDriver } = resolveMochifyDriver(config.driver);

  const driver_options = config.driver_options || {};
  let server = null;
  if (config.serve) {
    server = await startServer(config.serve, config.server_options);
    driver_options.url = `http://localhost:${server.port}`;
  }

  const driver_promise = mochifyDriver(driver_options);
  const bundler_promise = resolveBundle(config.bundle, config.files);

  const [driver, bundle, mocha, client] = await Promise.all([
    driver_promise,
    bundler_promise,
    readFile(require.resolve('mocha/mocha.js'), 'utf8'),
    readFile(require.resolve('./client'), 'utf8')
  ]);

  const configured_client = setupClient(client);
  await driver.evaluate(`${mocha}\n${configured_client}`);

  let exit_code;
  try {
    exit_code = await run(driver, mocha_runner, bundle, server);
  } finally {
    await shutdown(driver, server);
  }

  if (exit_code) {
    process.exitCode = exit_code;
  }
}

function resolveMochifyDriver(name = 'puppeteer') {
  // eslint-disable-next-line node/global-require
  return require(`@mochify/driver-${name}`);
}

async function shutdown(driver, server) {
  const shutdown_promises = [driver.end()];
  if (server) {
    shutdown_promises.push(server.close());
  }
  await Promise.all(shutdown_promises);
}
