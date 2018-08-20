/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var fs         = require('fs');
var url        = require('url');
var browserify = require('browserify');
var watchify   = require('watchify');
var coverify   = require('coverify');
var glob       = require('glob');
var mocaccino  = require('mocaccino');
var webdriver  = require('min-wd');
var resolve    = require('resolve');
var cover      = require('./cover');
var node       = require('./node');
var chromium   = require('./chromium');
var consolify  = require('./consolify');
var trace      = require('./trace');
var args       = require('./args');
var server     = require('./server');

function withServer(opts, callback) {
  if (Number.isInteger(opts['https-server'])) {
    server(opts['https-server'], callback);
  }
}

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
    if (opts.outfile) {
      opts.output = fs.createWriteStream(opts.outfile);
    } else {
      opts.output = process.stdout;
    }
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

  // Apply defaults when using the API
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

  if (opts.bundle && !opts.consolify) {
    console.log('--bundle must be used with --consolify option\n');
    process.exit(1);
  }

  if (opts.invert && !opts.grep) {
    console.log('--invert must be used with --grep option\n');
    process.exit(1);
  }

  if (opts['https-server'] && opts.url
      && String(opts['https-server']) !== opts.url.port) {
    console.log(
      'The port values in --https-server and --url did not match,'
      + ' got "' + opts['https-server'] + '" and "' + opts.url.port + '".\n'
      + 'You should be able to use the --url option only.'
    );
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
    console.error('Error: Nothing found for "' + globs.join('" or "') + '".\n');
    process.exit(1);
  }

  function error(err) {
    console.error(String(err) + '\n');
    process.exitCode = 1;
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
  brOpts.commondir = opts.commondir;

  var b = browserify(brOpts);

  var mocaccinoOpts = {
    reporter        : opts.reporter,
    reporterOptions : opts.reporterOptions,
    ui              : opts.ui,
    node            : opts.node,
    yields          : opts.yields,
    timeout         : opts.timeout,
    grep            : opts.grep,
    invert          : opts.invert,
    colors          : opts.colors,
    noColors        : opts.noColors
  };

  function serverReady(err, port, onError, handleEnd) {
    if (err) {
      console.error('Error: Failed to launch server\n' + err.stack + '\n');
      process.exit(1);
    }

    onError(function (err) {
      b.emit('error', err);
    });

    if (!opts.watch) {
      b.pipeline.get('wrap').on('end', function () {
        handleEnd();
      });
    }

    if (!opts.url) {
      opts.url = url.parse('https://localhost:' + port);
    } else {
      opts.url.port = port;
    }
    opts.url = url.format(opts.url);
  }

  if (opts.consolify) {
    b.plugin(consolify, opts);
  } else if (opts.node) {
    b.plugin(node, opts);
  } else if (opts.wd) {
    var wdOpts = {
      asyncPolling: opts['async-polling']
    };
    if (opts.url) {
      wdOpts.url = opts.url;
    }
    if (opts['wd-file']) {
      wdOpts.wdFile = opts['wd-file'];
    }
    b.plugin(webdriver, wdOpts);
    b.pipeline.get('wrap').push(trace());
    withServer(opts, serverReady);
  } else {
    b.plugin(chromium, opts);
    withServer(opts, serverReady);
  }

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

  entries.forEach(function (entry) {
    b.add(entry);
  });

  if (opts.external) {
    [].concat(opts.external).forEach(function (x) {
      b.external(x);
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
  if (opts['global-transform']) {
    [].concat(opts['global-transform']).forEach(function (t) {
      if (typeof t === 'string') {
        b.transform({ global: true }, t);
      } else {
        t.global = true;
        b.transform(t, t._.shift());
      }
    });
  }
  if (opts.require) {
    [].concat(opts.require).forEach(function (r) {
      b.require(resolve.sync(r, {
        basedir: process.cwd()
      }), {
        expose: r
      });
    });
  }
  if (opts.cover) {
    b.transform(coverify);
    b.plugin(cover);
  }

  b.on('error', error);
  b.on('bundle', function (out) {
    out.pipe(opts.output);
    out.on('error', function (err) {
      b.emit('error', err);
    });
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
