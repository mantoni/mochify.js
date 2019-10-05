/*eslint-env mocha*/
/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var assert = require('assert');
var args = require('../lib/args');
var run = require('./fixture/run');


describe('args', function () {

  it('sets defaults', function () {
    var opts = args([]);

    assert.equal(opts.watch, false);
    assert.equal(opts.cover, false);
    assert.equal(opts.node, false);
    assert.equal(opts.wd, false);
    assert.equal(opts.recursive, false);
    assert.equal(opts.reporter, 'spec');
    assert.equal(opts.timeout, 2000);
    assert.equal(opts.yields, 0);
    assert.equal(opts['allow-chrome-as-root'], false);
    assert.equal(opts['ignore-ssl-errors'], false);
    assert.equal(opts['browser-field'], true);
    assert.equal(opts.commondir, true);
    assert.equal(opts['request-interception'], true);
  });

  it('parses --reporter', function () {
    var opts = args(['--reporter', 'tap']);

    assert.equal(opts.reporter, 'tap');
  });

  it('parses -R', function () {
    var opts = args(['-R', 'tap']);

    assert.equal(opts.reporter, 'tap');
  });

  it('parses --timeout', function () {
    var opts = args(['--timeout', '3000']);

    assert.equal(opts.timeout, 3000);
  });

  it('parses -t', function () {
    var opts = args(['-t', '3000']);

    assert.equal(opts.timeout, 3000);
  });

  it('parses --ui', function () {
    var opts = args(['--ui', 'TDD']);

    assert.equal(opts.ui, 'TDD');
  });

  it('parses -U', function () {
    var opts = args(['-U', 'TDD']);

    assert.equal(opts.ui, 'TDD');
  });

  it('parses --watch', function () {
    var opts = args(['--watch']);

    assert(opts.watch);
  });

  it('parses -w', function () {
    var opts = args(['-w']);

    assert(opts.watch);
  });

  it('parses --node', function () {
    var opts = args(['--node']);

    assert(opts.node);
  });

  it('parses --wd', function () {
    var opts = args(['--wd']);

    assert(opts.wd);
  });

  it('parses --url', function () {
    var opts = args(['--url', 'https://localhost:8080/test.html']);

    assert.equal(opts.url.href, 'https://localhost:8080/test.html');
    assert.equal(opts['https-server'], 8080);
  });

  it('parses --wd-file', function () {
    var opts = args(['--wd-file', '.min-wd-other']);

    assert.equal(opts['wd-file'], '.min-wd-other');
  });

  it('parses --consolify', function () {
    var opts = args(['--consolify', 'some.html']);

    assert.equal(opts.consolify, 'some.html');
  });

  it('parses --bundle', function () {
    var opts = args(['--bundle', 'some.js']);

    assert.equal(opts.bundle, 'some.js');
  });

  it('parses --yields', function () {
    var opts = args(['--yields', '123']);

    assert.equal(opts.yields, 123);
  });

  it('parses -y', function () {
    var opts = args(['-y', '123']);

    assert.equal(opts.yields, 123);
  });

  it('parses --chrome', function () {
    var opts = args(['--chrome', '/foo/bar']);

    assert.equal(opts.chrome, '/foo/bar');
  });

  it('parses --dumpio', function () {
    var opts = args(['--dumpio']);

    assert(opts.dumpio);
  });

  it('parses --ignore-ssl-errors', function () {
    var opts = args(['--ignore-ssl-errors']);
    assert(opts['ignore-ssl-errors']);
  });

  it('parses --viewport-width', function () {
    var opts = args(['--viewport-width', '999']);
    assert.strictEqual(opts['viewport-width'], 999);
  });

  it('parses --viewport-height', function () {
    var opts = args(['--viewport-height', '888']);
    assert.strictEqual(opts['viewport-height'], 888);
  });

  it('parses --debug', function () {
    var opts = args(['--debug']);

    assert(opts.debug);
  });

  it('parses --transform', function () {
    var opts = args(['--transform', 'foo']);

    assert.equal(opts.transform, 'foo');
  });

  it('parses --global-transform', function () {
    var opts = args(['--global-transform', 'foo']);

    assert.equal(opts['global-transform'], 'foo');
  });

  it('parses --plugin', function () {
    var opts = args(['--plugin', 'foo']);

    assert.equal(opts.plugin, 'foo');
  });

  it('parses --require', function () {
    var opts = args(['--require', 'foo']);

    assert.equal(opts.require, 'foo');
  });

  it('parses --extension', function () {
    var opts = args(['--extension', 'foo']);

    assert.equal(opts.extension, 'foo');
  });

  it('parses -r', function () {
    var opts = args(['-r', 'foo']);

    assert.equal(opts.require, 'foo');
  });

  it('parses --grep', function () {
    var opts = args(['--grep', 'foo']);

    assert.equal(opts.grep, 'foo');
  });

  it('parses --invert', function () {
    var opts = args(['--invert', '--grep', 'abc']);

    assert(opts.invert);
  });

  it('parses --recursive', function () {
    var opts = args(['--recursive']);

    assert(opts.recursive);
  });

  it('parses --colors', function () {
    var opts = args(['--colors']);

    assert(opts.colors);
  });

  it('parses --no-colors', function () {
    var opts = args(['--no-colors']);

    assert.equal(opts.colors, false);
  });

  it('parses --browser-field', function () {
    var opts = args(['--browser-field']);

    assert(opts['browser-field']);
  });

  it('parses --no-browser-field', function () {
    var opts = args(['--no-browser-field']);

    assert.equal(opts['browser-field'], false);
  });

  it('parses --commondir', function () {
    var opts = args(['--commondir']);

    assert(opts.commondir);
  });

  it('parses --no-commondir', function () {
    var opts = args(['--no-commondir']);

    assert.equal(opts.commondir, false);
  });

  it('parses --path', function () {
    var opts = args(['--path', './source/']);

    assert.equal(opts.path, './source/');
  });

  it('parses --external', function () {
    var opts = args(['--external', 'foo']);

    assert.equal(opts.external, 'foo');
  });

  it('parses --outfile', function () {
    var opts = args(['--outfile', 'foo']);

    assert.equal(opts.outfile, 'foo');
  });

  it('parses -o as an alias for --outfile', function () {
    var opts = args(['-o', 'foo']);

    assert.equal(opts.outfile, 'foo');
  });

  it('parses --https-server', function () {
    var opts = args(['--https-server', '8080']);
    assert.strictEqual(opts['https-server'], 8080);

    var noValueOpts = args(['--https-server']);
    assert.strictEqual(noValueOpts['https-server'], 0);
  });


  it('parses --allow-chrome-as-root', function () {
    var opts = args(['--allow-chrome-as-root']);

    assert(opts['allow-chrome-as-root']);
  });

  it('defaults colors to null', function () {
    var opts = args([]);

    assert.strictEqual(opts.colors, null);
  });

  it('default async-polling to true', function () {
    var opts = args([]);

    assert(opts['async-polling']);
  });

  it('parses --async-polling', function () {
    var opts = args(['--async-polling', 'false']);

    assert.equal(opts['async-polling'], false);
  });

  it('parses --web-security', function () {
    var opts = args(['--web-security', 'true']);

    assert.equal(opts['web-security'], true);

    opts = args(['--web-security', 'false']);

    assert.equal(opts['web-security'], false);

    opts = args(['--web-security', 'blah']);

    assert.equal(opts['web-security'], false);
  });

  it('parses --no-request-interception', function () {
    var opts = args(['--no-request-interception']);

    assert.equal(opts['request-interception'], false);
  });

  it('fails with invert but no grep option', function (done) {
    run('passes', ['--invert'], function (code, stdout) {
      assert.equal(code, 1);
      assert.equal(stdout, '--invert must be used with --grep option\n\n');
      done();
    });
  });

  it('quits with usage', function (done) {
    run('passes', ['--unknown'], function (code, stdout) {
      assert.equal(code, 1);
      assert.equal(stdout, 'Unknown argument: --unknown\n'
                   + 'Run `mochify --help` for usage.\n\n');
      done();
    });
  });

  it('requires single glob to match', function (done) {
    run('passes', ['./unknown/*'], function (code, stdout, stderr) {
      assert.equal(code, 1);
      assert.equal(stderr, 'Error: Nothing found for "./unknown/*".\n\n');
      done();
    });
  });

  it('requires multiple globs to match', function (done) {
    run('passes', ['./thing-a/*', './thing-b/*'],
      function (code, stdout, stderr) {
        assert.equal(code, 1);
        assert.equal(stderr,
          'Error: Nothing found for "./thing-a/*" or "./thing-b/*".\n\n');
        done();
      });
  });

  it('fails with meaningful message if file is missing', function (done) {
    run('passes', ['./unknown-file.js'], function (code, stdout, stderr) {
      assert.notEqual(code, 0);
      assert(stderr.indexOf('/unknown-file.js') !== -1);
      done();
    });
  });

  it('fails with meaningful message for defaults', function (done) {
    run('.', [], function (code, stdout, stderr) {
      assert.equal(code, 1);
      assert.equal(stderr, 'Error: Nothing found for "./test/*.js".\n\n');
      done();
    });
  });

  it('fails with bundle but no consolify option', function (done) {
    run('passes', ['--bundle', 'foo.js'], function (code, stdout) {
      assert.equal(code, 1);
      assert.equal(stdout, '--bundle must be used with --consolify option\n\n');
      done();
    });
  });

  it('fails with meaningful message when given conflicting port values',
    function (done) {
      run('passes', ['--url', 'https://localhost:8080/test.html',
        '--https-server', '4040'],
      function (code, stdout) {
        assert.strictEqual(code, 1);
        assert(stdout.indexOf('got "4040" and "8080"') !== -1);
        done();
      });
    });
});
