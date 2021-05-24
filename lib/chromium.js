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
var util = require('util');
var through = require('through2');
var puppeteer = require('puppeteer');
var sourceMapper = require('source-mapper');
var trace = require('./trace');

var DEFAULT_URL = 'file:' + path.dirname(__dirname) + '/fixture/index.html';
var IGNORE_RESOURCE_TYPES = {
  stylesheet: true,
  image: true,
  media: true,
  font: true
};

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
    dumpio: !!opts.dumpio,
    ignoreHTTPSErrors: opts['ignore-ssl-errors'],
    args: ['--allow-insecure-localhost', '--disable-dev-shm-usage']
  };

  if (opts['allow-chrome-as-root']) {
    options.args.push('--no-sandbox', '--disable-setuid-sandbox');
  }

  if (opts['web-security'] === false) {
    options.args.push('--disable-web-security');
  }

  if (opts.chrome) {
    options.executablePath = opts.chrome;
  } else if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    // Workaround for https://github.com/puppeteer/puppeteer/issues/6957
    options.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }


  function finish() {
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
          // Swallow SSL vertificate warning that occurs on navigation before
          // the script is injected. Also swallow deprecation notices about
          // window.webkitStorageInfo.
          text.split('\n').forEach(function (line) {
            var skipLine = line.indexOf('SSL certificate') >= 0
              || line.indexOf(
                '\'window.webkitStorageInfo\' is deprecated'
              ) >= 0;
            if (skipLine) {
              return;
            }
            process.stderr.write(line);
            process.stderr.write('\n');
          });
          return;
        }
        if (text.indexOf('[COVERAGE ') === 0) {
          var nycRootID = process.env.NYC_ROOT_ID;
          if (!nycRootID) {
            // NYC >v15 does not export a NYC_ROOT_ID so use a "random" uuid
            nycRootID = '4638ceac-c8d9-411d-9e1f-72755846a221';
          }
          var nycConfig = JSON.parse(process.env.NYC_CONFIG);
          var json = text.substring(10, text.length - 1);
          var file = path.join(nycConfig.tempDir, nycRootID + '.json');
          fs.writeFile(file, json, 'utf8', function (err) {
            if (err) {
              b.emit('error', err);
            }
          });
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
        if (!options.dumpio) {
          // Only print console output if `--dumpio` is not specified, or the
          // output is printed twice.
          output.write(sourceMapper.line(consumer, text));
          output.write('\n');
        }
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
        output.write(util.inspect(err));
        output.write('\n');
      });

      // This switch can be used to work around an issue in puppeteer when
      // running scripts within a web worker. See
      // https://github.com/GoogleChrome/puppeteer/issues/4208
      if (opts['request-interception']) {
        // Prevent image and font requests from causing error messages:
        page.setRequestInterception(true);
        page.on('request', function (request) {
          if (IGNORE_RESOURCE_TYPES[request.resourceType()]) {
            // Respond with 200 ok or a warning is logged:
            request.respond({ status: 200 });
          } else {
            request.continue();
          }
        });
      }

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
