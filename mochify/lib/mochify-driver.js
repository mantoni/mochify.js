'use strict';

exports.resolveMochifyDriver = resolveMochifyDriver;

function resolveMochifyDriver(driver) {
  let driverModule = driver;
  let driverReference = 'given driver object';
  if (typeof driver === 'string') {
    try {
      // eslint-disable-next-line node/global-require
      driverModule = require(`@mochify/driver-${driver}`);
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
      // eslint-disable-next-line node/global-require
      driverModule = require(driver);
    }
    driverReference = `driver "${driver}"`;
  }

  if (!driverModule || typeof driverModule.mochifyDriver !== 'function') {
    let message = `Expected ${driverReference} to export a "mochifyDriver(options)" method.`;
    if (typeof driver === 'string') {
      message += ` Did you forget to install the "@mochify/driver-${driver}" package?`;
    }
    throw new TypeError(message);
  }

  return driverModule;
}
