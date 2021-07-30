#!/usr/bin/env node
'use strict';

const { promisify } = require('util');
const glob = promisify(require('glob'));
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { mochify } = require('@mochify/mochify');

const opts = yargs(hideBin(process.argv))
  .option('config', {
    type: 'string'
  })
  .option('driver', {
    type: 'string'
  })
  .option('driver-option', {
    type: 'object'
  })
  .option('reporter', {
    alias: 'R',
    type: 'string'
  })
  .option('bundle', {
    type: 'string'
  })
  .option('serve', {
    type: 'string'
  })
  .option('server-option', {
    type: 'object'
  })
  .parse();

if (opts['driver-option']) {
  opts.driver_options = opts['driver-option'];
}
if (opts['server-option']) {
  opts.server_options = opts['server-option'];
}

(async () => {
  const files = await resolveFiles(opts._);
  const options = Object.assign({ files }, opts);
  try {
    await mochify(options);
  } catch (e) {
    console.error(e.stack);
    process.exitCode = 1;
  }
})();

async function resolveFiles(patterns) {
  const matches = await Promise.all(patterns.map((pattern) => glob(pattern)));
  return matches.reduce((all, match) => all.concat(match), []);
}
