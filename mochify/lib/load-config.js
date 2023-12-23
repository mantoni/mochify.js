'use strict';

const deepmerge = require('deepmerge');
const { lilconfig } = require('lilconfig');

/**
 * @typedef {import('stream').Stream} Stream
 * @typedef {import('lilconfig').LilconfigResult} LilconfigResult
 * @typedef {keyof import('mocha').reporters} MochaReporter
 * @typedef {import('./mochify-driver').MochifyDriverModule} MochifyDriverModule
 */

/**
 * @typedef {Object} MochifyConfig
 * @property {MochaReporter} [reporter]
 * @property {string} [ui]
 * @property {number} [timeout]
 * @property {string | MochifyDriverModule} [driver]
 * @property {Object} [driver_options]
 * @property {string | string[] | Stream} [spec]
 * @property {boolean} [esm]
 * @property {string} [serve]
 * @property {Object} [server_options]
 * @property {string} [bundle]
 */
/**
 * @typedef {Object} MochifyOptionsProps
 * @property {string} [config]
 */
/**
 * @typedef {MochifyConfig & MochifyOptionsProps} MochifyOptions
 */

exports.loadConfig = loadConfig;

/**
 * @param {MochifyOptions} options
 * @returns {Promise<MochifyConfig>}
 */
async function loadConfig(options) {
  const explorer = lilconfig('mochify');

  const default_config_promise = explorer.search();

  if (options.config) {
    const specified = await explorer.load(options.config);
    if (specified) {
      const config = Object.assign(specified.config, options);
      return mergeWithDefault(default_config_promise, config);
    }
  }

  return mergeWithDefault(default_config_promise, options);
}

/**
 * @param {Promise<LilconfigResult>} default_config_promise
 * @param {MochifyOptions} config
 * @returns {Promise<MochifyConfig>}
 */
async function mergeWithDefault(default_config_promise, config) {
  const default_config = await default_config_promise;
  if (default_config) {
    return deepmerge(default_config.config, config, {
      clone: false
    });
  }
  return config;
}
