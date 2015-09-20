#!/usr/bin/env node

'use strict';

/**
 * This script attempts to find:
 *
 * - a locally installed or linked PhantomJS
 * - a PhantomJS in the PATH
 *
 * if neither of those are found, it will install PhantomJS locally.
 */

function log(msg) {
  var args = Array.prototype.slice(arguments, 1);
  args.unshift('=> ' + msg);
  console.log.apply(console, args);
}

function installPhantom(callback) {
  var exec = require('child_process').exec;

  log('Attempting to install PhantomJS locally');
  var install = exec('npm install phantomjs', function (err) {
    if (err) {
      return callback('Failed to install PhantomJS.  Do it manually');
    }
    log('Successfully installed PhantomJS.  To link it globally, '
      + 'execute:\n\tcd node_modules/phantomjs && npm link');
    callback();
  });
  install.stdout.pipe(process.stdout);
  install.stderr.pipe(process.stderr);
}

function whichPhantom(callback) {
  require('which')('phantomjs', function (err) {
    if (err) {
      log('PhantomJS not present in PATH');
      return installPhantom(callback);
    }
    log('PhantomJS found in PATH');
    callback();
  });
}

function lstatPhantom(callback) {
  var localPhantomPath = require('path').join(__dirname,
      '..',
      'node_modules',
      'phantomjs');
  require('fs').lstat(localPhantomPath, function (err, stats) {
    if (err) {
      log('PhantomJS not present locally; checking PATH');
      return whichPhantom(callback);
    }
    if (!stats.isSymbolicLink()) {
      log('PhantomJS present as local package');
    } else {
      log('PhantomJS already linked');
    }
    callback();
  });
}

function main() {
  log('Finding PhantomJS');

  lstatPhantom(function (err) {
    if (err) {
      return log('Mochify installed with warning(s): ' + err);
    }
    log('Mochify install complete!');
  });
}

if (require.main === module) {
  main();
}

