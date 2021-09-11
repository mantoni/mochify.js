#!/usr/bin/env node
'use strict';

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
  .option('esm', {
    type: 'boolean'
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
  if (opts._.length) {
    opts.spec = opts._;
  }
  delete opts._;
  try {
    const { exit_code } = await mochify(opts);
    process.exitCode = exit_code;
  } catch (e) {
    console.error(e.stack);
    process.exitCode = 1;
  }
})();
