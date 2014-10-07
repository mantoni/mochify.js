/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var subarg = require('subarg');
var glob   = require('glob');


module.exports = function (argv) {

  var opts = subarg(argv, {
    string     : ['reporter', 'ui', 'phantomjs', 'consolify', 'timeout',
                  'port', 'yields'],
    boolean    : ['help', 'version', 'watch', 'cover', 'node', 'wd', 'debug'],
    alias      : {
      help     : 'h',
      version  : 'v',
      watch    : 'w',
      reporter : 'R',
      ui       : 'U',
      timeout  : 't',
      yields   : 'y'
    },
    default    : {
      watch    : false,
      cover    : false,
      node     : false,
      debug    : false,
      wd       : false,
      reporter : 'dot',
      timeout  : '2000',
      port     : '0',
      yields   : '0'
    },
    unknown: function (arg) {
      if (arg.indexOf('-') === 0) {
        console.log('Unknown argument: ' + arg);
        console.log('Run `mochify --help` for usage.\n');
        process.exit(1);
      }
    }
  });

  if (opts.help) {
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

  if (opts.debug) {
    if (opts.node) {
      console.log('--debug does not work with --node\n');
      process.exit(1);
    }
    if (opts.wd) {
      console.log('--debug does not work with --wd\n');
      process.exit(1);
    }
  }

  var entries = [];
  if (!opts._.length) {
    opts._ = ['./test/*.js'];
  }
  opts._.forEach(function (arg) {
    if (arg.indexOf('*') === -1) {
      entries.push(arg);
    } else {
      Array.prototype.push.apply(entries, glob.sync(arg));
    }
  });
  if (!entries.length) {
    console.error('Error: Nothing found for "'
      + opts._.join('" or "') + '".\n');
    process.exit(1);
  }
  opts.entries = entries;

  return opts;
};
