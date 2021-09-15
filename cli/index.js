#!/usr/bin/env node
'use strict';

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { mochify } = require('@mochify/mochify');

const opts = yargs(hideBin(process.argv))
  .usage(
    '$0 [options] <spec...>',
    'Run Mocha tests using Mochify.',
    (local) => {
      local
        .example(
          '$0 --driver puppeteer --bundle browserify "./src/**/*.test.js" ',
          'Bundle all files matching the given spec using browserify and run them using @mochify/driver-puppeteer.'
        )
        .example(
          '$0 --config package.json "./src/**/*.test.js" ',
          'Run all tests matching the given spec using the configuration from package.json\'s "mochify" key.'
        )
        .example(
          '$0 --esm --reporter dot "./src/**/*.test.js" ',
          'Run all tests matching the given spec as ES modules and use the "dot" reporter for output.'
        );
    }
  )
  .option('config', {
    alias: 'C',
    type: 'string',
    group: 'Options:',
    describe:
      'The config file to use. In case `package.json` is given, the configuration is expected to be stored in a top-level "mochify" key. In case an option is present in both the config file and as a CLI flag, the flag takes precedence. Refer to the documentation of `@mochify/mochify` for available configuration options.'
  })
  .option('driver', {
    alias: 'D',
    type: 'string',
    group: 'Options:',
    describe:
      'The driver to use for running the tests. Drivers published to the @mochify scope can be referenced using their suffix only (e.g. `puppeteer`), third-party or local drivers will need to use the full package name or file path. Drivers need to be installed separately from the Mochify CLI.'
  })
  .option('driver-option', {
    type: 'object',
    group: 'Options:',
    describe:
      'Free form options to pass to the driver in use. Pass an arbitrary number of options using `--driver-option.foo 1 --driver-option.bar 2`. Refer to the documentation of the driver in use for available options.'
  })
  .option('reporter', {
    alias: 'R',
    type: 'string',
    group: 'Options:',
    describe:
      'The Mocha reporter to use. Right now, only reporters that are included with Mocha itself can be used.'
  })
  .option('bundle', {
    alias: 'B',
    type: 'string',
    group: 'Options:',
    describe:
      'The command used for bundling the given spec. The called executable is expected to be installed by the consumer. In case no bundle command is given and --esm is not used, spec files will be concatenated instead of bundling before running the test suite. The command will be passed the resolved value of <spec>.'
  })
  .option('esm', {
    type: 'boolean',
    group: 'Options:',
    describe:
      'Run a local web server and inject all files in the spec as <script type="module"> instead of bundling. The server serves the contents of the current working directory unless `--serve` is given, in which case the contents of the given location will be served instead.'
  })
  .option('serve', {
    alias: 'S',
    type: 'string',
    group: 'Options:',
    describe:
      'Run the tests in the context of a local web server. Files in the given directory will be served as static assets.'
  })
  .option('server-option', {
    type: 'object',
    group: 'Options:',
    describe:
      'Options to pass to the server in case `--serve` or `--esm` is being used. Currently only `--server-option.port` for passing the port to use is supported.'
  })
  .updateStrings({
    'Options:': 'Other:'
  })
  .conflicts('bundle', 'esm')
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
