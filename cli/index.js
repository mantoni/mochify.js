#!/usr/bin/env node
'use strict';

const { promisify } = require('util');
const glob = promisify(require('glob'));
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { mochify } = require('@mochify/mochify');

const opts = yargs(hideBin(process.argv))
  .option('reporter', {
    alias: 'R',
    type: 'string'
  })
  .parse();

// The bundle command to run (from config):
const config = {
  bundle: 'browserify --debug',
  reporter: opts.reporter
};

(async () => {
  config.files = await resolveFiles(opts._);
  try {
    await mochify(config);
  } catch (e) {
    console.error(e.stack);
    process.exitCode = 1;
  }
})();

async function resolveFiles(patterns) {
  const matches = await Promise.all(patterns.map((pattern) => glob(pattern)));
  return matches.reduce((all, match) => all.concat(match), []);
}
