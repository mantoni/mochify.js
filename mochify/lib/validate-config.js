'use strict';

/**
 * @typedef {import('./load-config').MochifyConfig} MochifyConfig
 */

exports.validateConfig = validateConfig;

/**
 * @param {MochifyConfig} config
 */
function validateConfig(config) {
  if (!config.driver) {
    throw new Error(
      'Specifying a `driver` is required. Mochify drivers need to be installed separately from the API or the CLI.'
    );
  }
  if (config.esm && config.bundle) {
    throw new Error('`esm` cannot be used in conjunction with `bundle`');
  }
  if (
    config.bundle &&
    typeof config.spec === 'object' &&
    !Array.isArray(config.spec) &&
    typeof config.spec.pipe === 'function'
  ) {
    throw new Error('`bundle` cannot be used when `spec` is a stream.');
  }
}
