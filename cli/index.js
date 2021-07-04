#!/usr/bin/env node
'use strict';

const { mochify } = require('@mochify/mochify');

const argv = process.argv.slice(2);

let reporter = 'spec';
if (argv[0] === '-R' || argv[0] === '--reporter') {
  reporter = argv[1];
}

// The bundle command to run (from config):
const bundle = 'browserify --debug';

// Resolved files from glob expression:
const files = ['./test.js'];

(async () => {
  try {
    await mochify({ reporter, bundle, files });
  } catch (e) {
    console.error(e.stack);
    process.exitCode = 1;
  }
})();
