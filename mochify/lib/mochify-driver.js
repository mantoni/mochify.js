'use strict';

/**
 * @typedef {import('../driver').MochifyDriver} MochifyDriver
 */

/**
 * @typedef {Object} MochifyDriverModule
 * @property {function(Object): Promise<MochifyDriver>} mochifyDriver
 */

exports.resolveMochifyDriver = resolveMochifyDriver;

/**
 * @param {string | MochifyDriverModule} [driver]
 * @returns {MochifyDriverModule}
 */
function resolveMochifyDriver(driver) {
  let driver_module;
  let driver_reference;

  if (typeof driver === 'string') {
    try {
      // eslint-disable-next-line n/global-require
      driver_module = require(`@mochify/driver-${driver}`);
    } catch (err) {
      if (/** @type {Object} */ (err).code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
      // eslint-disable-next-line n/global-require
      driver_module = require(driver);
    }
    driver_reference = `driver "${driver}"`;
  } else {
    driver_module = driver;
    driver_reference = 'given driver object';
  }

  if (!driver_module || typeof driver_module.mochifyDriver !== 'function') {
    let message = `Expected ${driver_reference} to export a "mochifyDriver(options)" method.`;
    if (typeof driver === 'string') {
      message += ` Did you forget to install the "@mochify/driver-${driver}" package?`;
    }
    throw new TypeError(message);
  }

  return driver_module;
}
