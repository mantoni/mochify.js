'use strict';

const { readFile } = require('fs').promises;
const { loadConfig } = require('./lib/load-config');
const { validateConfig } = require('./lib/validate-config');
const { setupClient } = require('./lib/setup-client');
const { createMochaRunner } = require('./lib/mocha-runner');
const { resolveBundle } = require('./lib/resolve-bundle');
const { resolveSpec } = require('./lib/resolve-spec');
const { startServer } = require('./lib/server');
const { run } = require('./lib/run');

exports.mochify = mochify;

async function mochify(options = {}) {
  const config = await loadConfig(options);

  const validation_error = validateConfig(config);
  if (validation_error) {
    throw validation_error;
  }

  // Create runner early to verify the reporter exists:
  const mocha_runner = createMochaRunner(config.reporter || 'spec');
  const { mochifyDriver } = resolveMochifyDriver(config.driver);

  const [mocha, client, resolved_spec] = await Promise.all([
    readFile(require.resolve('mocha/mocha.js'), 'utf8'),
    readFile(require.resolve('./client'), 'utf8'),
    resolveSpec(config.spec)
  ]);

  const configured_client = setupClient(client, config);
  const driver_options = config.driver_options || {};

  let server = null;
  if (config.serve || config.esm) {
    const _scripts = [mocha, configured_client];
    const _modules = config.esm ? resolved_spec : [];
    server = await startServer(
      config.serve || process.cwd(),
      Object.assign({ _scripts, _modules }, config.server_options)
    );
    driver_options.url = `http://localhost:${server.port}`;
  }

  const driver_promise = mochifyDriver(driver_options);
  const bundler_promise = config.esm
    ? Promise.resolve('')
    : resolveBundle(config.bundle, resolved_spec);

  let driver, bundle;
  try {
    [driver, bundle] = await Promise.all([driver_promise, bundler_promise]);
  } catch (e) {
    driver_promise
      .then((pending_driver) => {
        shutdown(pending_driver, server);
      })
      .catch(() => {
        shutdown(null, server);
      });
    throw e;
  }

  if (!server) {
    await driver.evaluate(`${mocha}\n${configured_client}`);
  }

  let exit_code;
  try {
    exit_code = await run(driver, mocha_runner, bundle, server);
  } finally {
    await shutdown(driver, server);
  }

  return { exit_code };
}

function resolveMochifyDriver(name) {
  let driverModule;
  try {
    // eslint-disable-next-line node/global-require
    driverModule = require(`@mochify/driver-${name}`);
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err;
    }
    // eslint-disable-next-line node/global-require
    driverModule = require(name);
  }

  if (!driverModule || typeof driverModule.mochifyDriver !== 'function') {
    throw new Error(
      `Expected driver "${name}" to export a "mochifyDriver(options)" method. Did you forget to install the "@mochify/driver-${name}" package?`
    );
  }

  return driverModule;
}

async function shutdown(driver, server) {
  const shutdown_promises = [];
  if (driver) {
    shutdown_promises.push(driver.end());
  }
  if (server) {
    shutdown_promises.push(server.close());
  }
  await Promise.all(shutdown_promises);
}
