/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var subarg = require('subarg');
var url = require('url');

var defaults = {
  watch: false,
  cover: false,
  node: false,
  debug: false,
  dumpio: false,
  wd: false,
  recursive: false,
  'ignore-ssl-errors': false,
  'browser-field': true,
  commondir: true,
  reporter: 'spec',
  timeout: '2000',
  yields: '0',
  colors: null,
  'async-polling': true,
  'request-interception': true,
  'detect-globals': true
};

function args(argv) {
  var opts = subarg(argv, {
    string: ['reporter', 'ui', 'chrome', 'consolify', 'timeout', 'port',
      'yields', 'transform', 'global-transform', 'plugin', 'grep', 'url',
      'require', 'extension', 'bundle', 'wd-file', 'path', 'external',
      'viewport-width', 'viewport-height', 'outfile', 'https-server',
      'mocha-path', 'web-security'],
    boolean: ['help', 'version', 'watch', 'cover', 'node', 'wd', 'debug',
      'invert', 'recursive', 'colors', 'ignore-ssl-errors', 'browser-field',
      'commondir', 'allow-chrome-as-root', 'async-polling', 'dumpio',
      'request-interception', 'detect-globals'],
    alias: {
      help: 'h',
      version: 'v',
      watch: 'w',
      reporter: 'R',
      ui: 'U',
      timeout: 't',
      yields: 'y',
      require: 'r',
      outfile: 'o'
    },
    default: defaults,
    unknown: function (arg) {
      if (arg.indexOf('-') === 0) {
        console.log('Unknown argument: ' + arg);
        console.log('Run `mochify --help` for usage.\n');
        process.exit(1);
      }
    }
  });

  if (opts.help) {
    /*eslint no-sync: 0*/
    console.log(require('fs').readFileSync(__dirname + '/help.txt', 'utf8'));
    process.exit(0);
  }
  if (opts.version) {
    console.log(require('../package.json').version);
    process.exit(0);
  }

  ['timeout', 'port', 'yields', 'viewport-height', 'viewport-width']
    .forEach(function (prop) {
      if (Object.hasOwnProperty.call(opts, prop)) {
        opts[prop] = parseInt(opts[prop], 10);
      }
    });

  if (Object.hasOwnProperty.call(opts, 'url')) {
    opts.url = url.parse(opts.url);
    delete opts.url.host;
  }

  if (Object.hasOwnProperty.call(opts, 'https-server')) {
    opts['https-server'] = parseInt(opts['https-server'], 10) || 0;
  } else if (Object.hasOwnProperty.call(opts, 'url')) {
    opts['https-server'] = parseInt(opts.url.port, 10) || 0;
  }

  if (Object.hasOwnProperty.call(opts, 'web-security')) {
    opts['web-security'] = opts['web-security'] === 'true';
  }

  return opts;
}

args.defaults = defaults;

module.exports = args;
