'use strict';

const { promisify } = require('util');
const glob = promisify(require('glob'));

exports.resolveSpec = resolveSpec;

async function resolveSpec(spec = 'test/**/*.js') {
  if (typeof spec === 'object' && typeof spec.pipe === 'function') {
    return spec;
  }

  const patterns = Array.isArray(spec) ? spec : [spec];
  const matches = await Promise.all(patterns.map((pattern) => glob(pattern)));
  return matches.reduce((all, match) => all.concat(match), []);
}
