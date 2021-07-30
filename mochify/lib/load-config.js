'use strict';

const { cosmiconfig } = require('cosmiconfig');

exports.loadConfig = loadConfig;

async function loadConfig(options) {
  const explorer = cosmiconfig('mochify');

  const default_config_promise = explorer.search();

  const config_path = options.config;
  if (config_path) {
    const [default_config, specified_config] = await Promise.all([
      default_config_promise,
      explorer.load(config_path)
    ]);

    const config = Object.assign(specified_config.config, options);
    if (default_config) {
      return Object.assign(default_config.config, config);
    }
    return config;
  }

  const default_config = await default_config_promise;
  if (default_config) {
    return Object.assign(default_config.config, options);
  }
  return options;
}
