'use strict';

exports.validateConfig = validateConfig;

function validateConfig(config) {
  if (!config.driver) {
    return new Error(
      'Specifying a `driver` is required. Mochify drivers need to be installed separately from the API or the CLI.'
    );
  }
  if (config.esm && config.bundle) {
    return new Error('`esm` cannot be used in conjunction with `bundle`');
  }
  if (
    config.bundle &&
    typeof config.spec === 'object' &&
    typeof config.spec.pipe === 'function'
  ) {
    return new Error('`bundle` cannot be used when `spec` is a stream.');
  }
  return null;
}
