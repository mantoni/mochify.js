'use strict';

const deepmerge = require('deepmerge');
const { cosmiconfig } = require('cosmiconfig');

exports.loadConfig = loadConfig;

async function loadConfig(options) {
  const explorer = cosmiconfig('mochify');

  const default_config_promise = explorer.search();

  let merged;
  if (options.config) {
    const specified = await explorer.load(options.config);
    const config = Object.assign(specified.config, options);
    merged = await mergeWithDefault(default_config_promise, config);
  } else {
    merged = await mergeWithDefault(default_config_promise, options);
  }

  const validation_error = validate(merged);
  if (validation_error) {
    throw validation_error;
  }
  return merged;
}

async function mergeWithDefault(default_config_promise, config) {
  const default_config = await default_config_promise;
  if (default_config) {
    return deepmerge(default_config.config, config, {
      clone: false
    });
  }
  return config;
}

function validate(config) {
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
