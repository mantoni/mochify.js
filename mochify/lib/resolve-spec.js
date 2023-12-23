'use strict';

const { promisify } = require('util');
const glob = promisify(require('glob'));

/**
 * @typedef {import('stream').Stream} Stream
 */

exports.resolveSpec = resolveSpec;

/**
 * @param {string | string[] | Stream} [spec]
 * @returns {Promise<string | Stream>}
 */
async function resolveSpec(spec = 'test/**/*.js') {
  if (
    typeof spec === 'object' &&
    !Array.isArray(spec) &&
    typeof spec.pipe === 'function'
  ) {
    return spec;
  }

  const patterns = Array.isArray(spec) ? spec : [spec];
  const matches = await Promise.all(patterns.map((pattern) => glob(pattern)));
  return matches.reduce((all, match) => all.concat(match), []);
}
