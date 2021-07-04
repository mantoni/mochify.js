#!/usr/bin/env node
/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var mochify = require('../lib/mochify');
var args    = require('../lib/args');

var opts = args(process.argv.slice(2));
var _    = opts._.length
  ? opts._.join(' ')
  : null;

function error() {
  if (!opts.watch) {
    process.nextTick(function () {
      process.exit(1);
    });
  }
}

mochify(_, opts)
  .on('error', error)
  .bundle();
