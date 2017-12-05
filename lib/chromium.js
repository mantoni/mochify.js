/*
 * mochify.js
 *
 * Copyright (c) Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var through = require('through2');
var puppeteer = require('puppeteer');
var sourceMapper = require('source-mapper');
var trace = require('./trace');

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
  var done;
  var browser;

  var options = {
    devtools: !!opts.debug,
    ignoreHTTPSErrors: opts['ignore-ssl-errors']
  };

  function load() {
    browser.newPage().then(function (page) {
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

      function finish() {
        output.end();

        if (done) {
          done();
          done = null;
          output = null;
          if (opts.watch) {
            page.close();
            input = through();
            output = through();
            load();
          } else {
            browser.close();
          }
        }
      }

      var consumer;
      page.on('console', function (msg) {
        if (msg.text.indexOf('[EXIT ') === 0) {
          var code = msg.text.substring(6, msg.text.length - 1);
          if (code !== '0') {
            b.emit('error', new Error('Exit ' + code));
          }
          finish();
          return;
        }
        output.write(sourceMapper.line(consumer, msg.text));
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

      page.goto('file:' + __dirname + '/empty.html').then(function () {
        var script = '';
        input.on('data', function (data) {
          script += data;
        });
        input.on('end', function () {
          if (script) {
            var x = sourceMapper.extract(script);
            consumer = sourceMapper.consumer(x.map);
            page.evaluate(x.js);
            page.evaluate(broutHandler);
          } else {
            finish();
          }
        });
      });
    });
  }

  puppeteer.launch(options).then(function (p) {
    browser = p;
    load();
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
    bundle.on('error', function () {
      if (input) {
        input.end();
        input = null;
        if (opts.watch) {
          input = through();
          output = through();
          load();
        }
      }
    });
  });

};
