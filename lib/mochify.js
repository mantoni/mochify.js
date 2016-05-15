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
var resolve    = require('resolve');
var cover      = require('./cover');
var node       = require('./node');
var phantom    = require('./phantom');
var consolify  = require('./consolify');
var trace      = require('./trace');
var args       = require('./args');


module.exports = function (_, opts) {
  if (_ === null) {
    _ = './test/*.js';
  } else if (typeof _ !== 'string') {
    opts = _;
    _ = './test/*.js';
  }
  if (!opts) {
    opts = {};
  }
  if (!opts.output) {
    opts.output = process.stdout;
  }
  if (opts.recursive) {
    if (!_) {
      _ = './test/**/*.js';
    } else {
      var p = _.indexOf('*');
      if (p === -1) {
        _ += '/**/*.js';
      } else {
        _ = _.substring(0, p) + '**/' + _.substring(p);
      }
    }
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
      Array.prototype.push.apply(entries, glob.sync(arg, opts.glob || {}));
    }
  });
  if (!entries.length) {
    console.error('Error: Nothing found for "'
      + globs.join('" or "') + '".\n');
    process.exit(1);
  }

  function error(err) {
    console.error(String(err) + '\n');
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
  brOpts.extensions = opts.extension;
  brOpts.browserField = opts['browser-field'];
  brOpts.paths = opts.path;

  var b = browserify(brOpts);

  var mocaccinoOpts = {
    reporter : opts.reporter,
    ui       : opts.ui,
    node     : opts.node,
    yields   : opts.yields,
    timeout  : opts.timeout,
    grep     : opts.grep,
    invert   : opts.invert,
    colors   : opts.colors,
    noColors : opts.noColors
  };

  if (opts.consolify) {
    b.plugin(consolify, opts);
  } else if (opts.node) {
    b.plugin(node, opts);
  } else if (opts.wd) {
    var wdOpts = {};
    if (opts.url) {
      wdOpts.url = opts.url;
    }
    if (opts['wd-file']) {
      wdOpts.wdFile = opts['wd-file'];
    }
    b.plugin(webdriver, wdOpts);
    if (process.stdout.getWindowSize) {
      mocaccinoOpts.windowWidth = process.stdout.getWindowSize()[0];
    }
    b.pipeline.get('wrap').push(trace());
  } else {
    b.plugin(phantom, opts);
  }

  entries.forEach(function (entry) {
    b.add(entry);
  });

  b.plugin(mocaccino, mocaccinoOpts);

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
  if (opts.require) {
    [].concat(opts.require).forEach(function (r) {
      b.add(resolve.sync(r, {
        basedir: process.cwd()
      }));
    });
  }

  if (opts.cover) {
    b.transform(coverify);
    b.plugin(cover);
  }

  b.on('error', error);
  b.on('bundle', function (out) {
    out.on('error', error);
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
      function next() {
        bundling = false;
        if (queued) {
          queued = false;
          setImmediate(bundle);
        }
      }
      out.on('error', next);
      out.on('end', next);
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

  return b;
};
