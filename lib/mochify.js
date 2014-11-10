/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var browserify = require('browserify');
var watchify   = require('watchify');
var coverify   = require('coverify');
var glob       = require('glob');
var mocaccino  = require('mocaccino');
var webdriver  = require('min-wd');
var cover      = require('./cover');
var node       = require('./node');
var phantom    = require('./phantom');
var consolify  = require('./consolify');
var args       = require('./args');
var path       = require('path');


module.exports = function (_, opts, callback) {
  if (_ === null) {
    _ = './test/*.js';
  } else if (typeof _ !== 'string') {
    callback = opts;
    opts = _;
    _ = './test/*.js';
  }
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  if (!opts) {
    opts = {};
  }
  if (!opts.output) {
    opts.output = process.stdout;
  }

  Object.keys(args.defaults).forEach(function (key) {
    if (!opts.hasOwnProperty(key)) {
      opts[key] = args.defaults[key];
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

  if (opts.invert && !opts.grep) {
    console.log('--invert must be used with --grep option\n');
    process.exit(1);
  }

  var entries = [];
  var globs = _.split(' ');
  globs.forEach(function (arg) {
    if (arg.indexOf('*') === -1) {
      entries.push(arg);
    } else {
      Array.prototype.push.apply(entries, glob.sync(arg));
    }
  });
  if (!entries.length) {
    console.error('Error: Nothing found for "'
      + globs.join('" or "') + '".\n');
    process.exit(1);
  }

  function error(err) {
    console.error(String(err) + '\n');
    if (!opts.watch && callback) {
      callback(err);
    }
  }

  var brOpts = {
    debug        : true,
    cache        : {},
    packageCache : {}
  };
  if (opts.node) {
    brOpts.builtins = false;
    brOpts.commondir = false;
    brOpts.detectGlobals = false;
    brOpts.insertGlobalVars = ['__dirname', '__filename'];
  }
  // baseSrcPath : string
  if (opts.baseSrcPath) {
    var baseSrcPath = path.resolve(opts.baseSrcPath);
    brOpts.paths = [baseSrcPath];
  }

  var b = browserify(brOpts);

  if (opts.consolify) {
    b.plugin(consolify, opts);
  } else if (opts.node) {
    b.plugin(node, opts);
  } else if (opts.wd) {
    b.plugin(webdriver, { timeout : 0 });
  } else {
    b.plugin(phantom, opts);
  }
  if (opts.cover) {
    b.transform(coverify);
    b.plugin(cover);
  }

  entries.forEach(function (entry) {
    b.add(entry);
  });

  b.plugin(mocaccino, {
    reporter : opts.reporter,
    ui       : opts.ui,
    node     : opts.node,
    yields   : opts.yields,
    timeout  : opts.timeout,
    grep     : opts.grep,
    invert   : opts.invert
  });

  if (opts.plugin) {
    [].concat(opts.plugin).forEach(function (p) {
      if (typeof p === 'string') {
        b.plugin(p, {});
      } else {
        b.plugin(p._.shift(), p);
      }
    });
  }
  if (opts.transform) {
    [].concat(opts.transform).forEach(function (t) {
      if (typeof t === 'string') {
        b.transform({}, t);
      } else {
        b.transform(t, t._.shift());
      }
    });
  }

  b.on('error', error);
  b.on('bundle', function (out) {
    out.on('error', function (err) {
      console.error(String(err) + '\n');
    });
    out.pipe(opts.output);
  });

  if (opts.watch) {
    var w = watchify(b);
    var bundling = false;
    var queued = false;

    var bundle = function () {
      if (!bundling) {
        bundling = true;
        b.bundle();
      } else {
        queued = true;
      }
    };
    w.on('update', bundle);
    b.on('bundle', function (out) {
      out.on('end', function () {
        bundling = false;
        if (queued) {
          queued = false;
          setImmediate(bundle);
        }
      });
    });

    process.on('SIGINT', function () {
      w.close();
      setTimeout(function () {
        process.exit(0);
      }, 50);
    });

    // Hack for Windows:
    if (require('os').platform() === 'win32') {
      var readline = require('readline');
      var rl = readline.createInterface({
        input  : process.stdin,
        output : process.stdout
      });
      rl.on('SIGINT', function () {
        process.emit('SIGINT');
      });
    }
  }

  b.bundle(callback);
};
