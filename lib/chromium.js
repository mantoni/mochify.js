/*
 * mochify.js
 *
 * Copyright (c) Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var fs = require('fs');
var path = require('path');
var through = require('through2');
var puppeteer = require('puppeteer');
var sourceMapper = require('source-mapper');
var trace = require('./trace');

var DEFAULT_URL = 'file:' + path.dirname(__dirname) + '/fixture/index.html';

function broutHandler() {
  if (typeof process === 'undefined') {
    console.log('[EXIT 1]');
    return;
  }
  var log = console.log.original;
  process._brout.on('exit', function (code) {
    if (typeof __coverage__ !== 'undefined') {
      // eslint-disable-next-line no-undef
      log.call(console, '[COVERAGE ' + JSON.stringify(__coverage__) + ']');
    }
    log.call(console, '[EXIT ' + (code || 0) + ']');
  });
}

module.exports = function (b, opts) {
  var input = through();
  var output = through();
  var browser;
  var done;
  var load;

  var options = {
    devtools: !!opts.debug,
    ignoreHTTPSErrors: opts['ignore-ssl-errors'],
    args: ['--allow-insecure-localhost']
  };

  if (opts['allow-chrome-as-root']) {
    options.args.push('--no-sandbox', '--disable-setuid-sandbox');
  }

  if (opts.chrome) {
    options.executablePath = opts.chrome;
  }

  function finish() {
    if (output) {
      output.end();
      output = null;
    }
    if (done) {
      done();
      done = null;
    }
    if (opts.watch) {
      input = through();
      output = through();
      load(); // Preload another page for the next test run
    } else if (browser) {
      browser.close();
      browser = null;
    }
  }

  load = function () {
    browser.newPage().then(function (page) {

      function pageFinish() {
        if (page) {
          page.close().then(finish);
          page = null;
        } else {
          finish();
        }
      }

      if (!input) {
        pageFinish();
        return null;
      }

      var viewport = page.viewport();
      var width = opts['viewport-width'];
      var height = opts['viewport-height'];
      if (width) {
        viewport.width = width;
      }
      if (height) {
        viewport.height = height;
      }
      page.setViewport(viewport);

      var consumer;
      page.on('console', function (msg) {
        var text = msg.text();
        if (msg.type() !== 'log') {
          process.stderr.write(text);
          process.stderr.write('\n');
          return;
        }
        if (text.indexOf('[COVERAGE ') === 0) {
          if (process.env.NYC_ROOT_ID) {
            var nycConfig = JSON.parse(process.env.NYC_CONFIG);
            var json = text.substring(10, text.length - 1);
            var file = path.join(nycConfig.tempDir,
              process.env.NYC_ROOT_ID + '.json');
            fs.writeFile(file, json, 'utf8', function (err) {
              if (err) {
                b.emit('error', err);
              }
            });
            return;
          }
          output.write('Coverage information received, but no nyc\n');
          return;
        }
        if (text.indexOf('[EXIT ') === 0) {
          var code = text.substring(6, text.length - 1);
          if (code !== '0') {
            b.emit('error', new Error('Exit ' + code));
          }
          pageFinish();
          return;
        }
        output.write(sourceMapper.line(consumer, text));
        output.write('\n');
      });

      var handlePageError = function (exit) {
        return function (err) {
          err.message.split('\n').forEach(function (line) {
            output.write(sourceMapper.line(consumer, line));
            output.write('\n');
          });
          if (exit) {
            b.emit('error', new Error('Exit 1'));
          }
        };
      };

      // Uncaught error, possibly a failing async test
      page.on('pageerror', handlePageError(false));

      page.on('error', function (err) {
        // Page crash
        output.write(String(err));
        output.write('\n');
      });

      // We need a "real" web page loaded from a URL, or things like
      // localStorage are disabled.
      var pageUrl = opts.url || DEFAULT_URL;
      return page.goto(pageUrl).then(function () {
        if (!input) {
          // Bundle error.
          pageFinish();
          return;
        }
        var script = '';
        input.on('data', function (data) {
          script += data;
        });
        input.on('end', function () {
          if (script) {
            if (opts.reporter !== 'xunit') {
              opts.output.write('# chromium:\n');
            }
            var x = sourceMapper.extract(script);
            consumer = sourceMapper.consumer(x.map);
            page.evaluate(x.js).catch(handlePageError(true));
            page.evaluate(broutHandler).catch(handlePageError(true));
          } else {
            pageFinish();
          }
        });
      });
    }).catch(function (err) {
      b.emit('error', err);
      finish();
    });
  };

  puppeteer.launch(options).then(function (p) {
    if (!input) {
      // Bundle error.
      p.close();
      return;
    }
    browser = p;
    load(); // preload first page
  }).catch(function (err) {
    b.emit('error', err);
    finish();
  });

  function apply() {
    var wrap = b.pipeline.get('wrap');

    wrap.push(through(function (chunk, enc, next) {
      if (input) {
        input.write(chunk);
      }
      next();
    }, function (next) {
      done = next;
      if (input) {
        input.end();
      }
    }));

    wrap.push(output.pipe(trace()));
  }

  apply();
  b.on('reset', apply);
  b.on('bundle', function (bundle) {
    bundle.on('error', function () {
      if (input) {
        input.end();
        input = null;
      }
    });
  });

};
