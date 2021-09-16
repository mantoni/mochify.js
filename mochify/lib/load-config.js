'use strict';

const deepmerge = require('deepmerge');
const { cosmiconfig } = require('cosmiconfig');

exports.loadConfig = loadConfig;

async function loadConfig(options) {
  const explorer = cosmiconfig('mochify');

  const default_config_promise = explorer.search();

  if (options.config) {
    const specified = await explorer.load(options.config);
    const config = Object.assign(specified.config, options);
    return mergeWithDefault(default_config_promise, config);
  }

  return mergeWithDefault(default_config_promise, options);
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
