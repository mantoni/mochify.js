/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var subarg = require('subarg');

var defaults = {
  watch     : false,
  cover     : false,
  node      : false,
  debug     : false,
  wd        : false,
  recursive : false,
  'ignore-ssl-errors': false,
  'browser-field': true,
  reporter  : 'dot',
  timeout   : '2000',
  port      : '0',
  yields    : '0',
  colors    : null
};

function args(argv) {
  var opts = subarg(argv, {
    string     : ['reporter', 'ui', 'phantomjs', 'consolify', 'timeout',
                  'port', 'yields', 'transform', 'plugin', 'grep', 'url',
                  'require', 'extension', 'web-security', 'bundle',
                  'wd-file', 'path'],
    boolean    : ['help', 'version', 'watch', 'cover', 'node', 'wd',
                  'debug', 'invert', 'recursive', 'colors',
                  'ignore-ssl-errors', 'browser-field'],
    alias      : {
      help     : 'h',
      version  : 'v',
      watch    : 'w',
      reporter : 'R',
      ui       : 'U',
      timeout  : 't',
      yields   : 'y',
      require  : 'r'
    },
    default    : defaults,
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

  ['timeout', 'port', 'yields'].forEach(function (prop) {
    if (opts.hasOwnProperty(prop)) {
      opts[prop] = parseInt(opts[prop], 10);
    }
  });

  if (opts.hasOwnProperty('web-security')) {
    opts['web-security'] = opts['web-security'] === 'true';
  }

  return opts;
}

args.defaults = defaults;

module.exports = args;
