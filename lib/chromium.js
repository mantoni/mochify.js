/*
 * mochify.js
 *
 * Copyright (c) Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var fs = require('fs');
var url = require('url');
var path = require('path');
var https = require('https');
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
    log.call(console, '[EXIT ' + (code || 0) + ']');
  });
}

module.exports = function (b, opts) {
  var input = through();
  var output = through();
  var browser;
  var done;
  var load;
  var server;

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
    } else {
      if (browser) {
        browser.close();
        browser = null;
      }
      if (server) {
        server.close();
        server = null;
      }
    }
  }

  load = function () {
    browser.newPage().then(function (page) {
      if (!input) {
        return;
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

      function pageFinish() {
        if (page) {
          page.close().then(finish);
          page = null;
        } else {
          finish();
        }
      }

      var consumer;
      page.on('console', function (msg) {
        var text = msg.text();
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
      page.on('pageerror', function (err) {
        // Uncaught error
        err.message.split('\n').forEach(function (line) {
          output.write(sourceMapper.line(consumer, line));
          output.write('\n');
        });
      });
      page.on('error', function (err) {
        // Page crash
        output.write(String(err));
        output.write('\n');
      });

      // We need a "real" web page loaded from a URL, or things like
      // localStorage are disabled.
      var pageUrl = opts.url ? url.format(opts.url) : DEFAULT_URL;
      page.goto(pageUrl).then(function () {
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
            var x = sourceMapper.extract(script);
            consumer = sourceMapper.consumer(x.map);
            page.evaluate(x.js).then(function () {}, function () {});
            page.evaluate(broutHandler).then(function () {}, function () {});
          } else {
            pageFinish();
          }
        });
      }, function (err) {
        b.emit('error', err);
        finish();
      });
    });
  };

  var serverPort = opts['https-server'];
  if (Number.isInteger(serverPort)) {
    server = https.createServer({
      key: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'cert.pem')),
    }, function (req, res) {
      if (req.url === '/') {
        res.writeHead(200);
        res.end('<!DOCTYPE html>\n<html><body></body></html>');
      } else {
        var file = req.url.substring(1);
        fs.stat(file, function (err) {
          if (err) {
            res.writeHead(404);
            res.end();
            return;
          }
          res.writeHead(200);
          fs.createReadStream(file).pipe(res);
        });
      }
    });

    server.on('error', function (err) {
      b.emit('error', err);
      finish();
    });

    server.listen(serverPort, function () {
      if (!opts.url) {
        opts.url = url.parse('https://localhost:' + server.address().port);
      } else {
        opts.url.port = server.address().port;
      }
    });
  }

  puppeteer.launch(options).then(function (p) {
    if (!input) {
      // Bundle error.
      finish();
      return;
    }
    browser = p;
    load(); // preload first page
  }, function (err) {
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
      if (opts.reporter !== 'xunit') {
        opts.output.write('# chromium:\n');
      }
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
    bundle.on('error', function (err) {
      b.emit('error', err); // Forward error to end the pipeline.
      if (input) {
        input.end();
        input = null;
      }
      finish();
    });
  });

};
