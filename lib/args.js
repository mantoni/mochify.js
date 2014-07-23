/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var glob = require('glob');

function bool() {
  return true;
}

function string(argv) {
  return argv.shift();
}

function int(argv) {
  return parseInt(argv.shift(), 10);
}

function help() {
  console.log(require('fs').readFileSync(__dirname + '/help.txt', 'utf8'));
  process.exit(0);
}

function version() {
  console.log(require('../package.json').version);
  process.exit(0);
}

var map = {
  help      : help,
  version   : version,
  watch     : bool,
  cover     : bool,
  node      : bool,
  wd        : bool,
  debug     : bool,
  reporter  : string,
  ui        : string,
  phantomjs : string,
  timeout   : int,
  port      : int,
  yields    : int
};

var alias = {
  h : 'help',
  v : 'version',
  w : 'watch',
  R : 'reporter',
  U : 'ui',
  t : 'timeout',
  y : 'yields'
};


module.exports = function (argv) {
  var opts = {
    watch    : false,
    cover    : false,
    node     : false,
    debug    : false,
    wd       : false,
    reporter : 'dot',
    timeout  : 2000,
    port     : 0,
    yields   : 0
  };

  var arg, opt;
  while (argv.length && argv[0].indexOf('-') === 0) {
    arg = argv.shift();
    if (arg.indexOf('--') === 0) {
      opt = arg.substring(2);
    } else {
      opt = alias[arg.substring(1)];
    }
    if (!opt || !map[opt]) {
      console.log('Unknown argument: ' + arg);
      console.log('Run `mochify --help` for usage.\n');
      process.exit(1);
    }
    opts[opt] = map[opt](argv);
  }

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
  if (!argv.length) {
    argv = ['./test/*.js'];
  }
  argv.forEach(function (arg) {
    if (arg.indexOf('*') === -1) {
      entries.push(arg);
    } else {
      Array.prototype.push.apply(entries, glob.sync(arg));
    }
  });
  if (!entries.length) {
    console.error('Error: Nothing found for "' + argv.join('" or "') + '".\n');
    process.exit(1);
  }
  opts.entries = entries;

  return opts;
};
