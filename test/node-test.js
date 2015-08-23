/*global describe, it*/
/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var assert    = require('assert');
var run       = require('./fixture/run');
var transform = require('./fixture/transform');


describe('node', function () {

  it('passes', function (done) {
    run('passes', ['--node', '-R', 'tap'], function (code, stdout) {
      assert.equal(stdout, '# node:\n'
        + '1..1\n'
        + 'ok 1 test passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('fails', function (done) {
    run('fails', ['--node', '-R', 'tap'], function (code, stdout) {
      assert.equal(stdout.indexOf('# node:\n'
        + '1..1\n'
        + 'not ok 1 test fails\n'
        + '  Error: Oh noes!'), 0);
      assert.equal(code, 1);
      done();
    });
  });

  it('coverage tap', function (done) {
    run('passes', ['--node', '--cover', '-R', 'tap'], function (code, stdout) {
      assert.equal(stdout, '# node:\n'
        + '1..1\n'
        + 'ok 1 test passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n# coverage: 8/8 (100.00 %)\n\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('coverage dot', function (done) {
    run('passes', ['--node', '--cover', '--no-colors'],
      function (code, stdout) {
        var lines = stdout.trim().split(/\n+/);
        assert.equal(lines[0], '# node:');
        assert.equal(lines[1], '  .');
        assert.equal(lines[3], '# coverage: 8/8 (100.00 %)');
        assert.equal(code, 0);
        done();
      });
  });

  it('fails if test fails but coverage is fine', function (done) {
    run('fails', ['--node', '--cover', '-R', 'tap'], function (code) {
      assert.equal(code, 1);
      done();
    });
  });

  it('fails cover', function (done) {
    run('fails-cover', ['--node', '--cover', '-R', 'tap'],
      function (code, stdout) {
        var testOut = '# node:\n'
          + '1..1\n'
          + 'ok 1 test does not cover\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n';
        var coverOut = '\n# coverage: 9/10 (90.00 %)\n\nError: Exit 1\n\n';
        assert.equal(stdout.substring(0, testOut.length), testOut);
        assert.equal(stdout.substring(stdout.length - coverOut.length),
            coverOut);
        assert.equal(code, 1);
        done();
      });
  });

  it('times out', function (done) {
    run('timeout', ['--node', '-R', 'tap', '--timeout', '10'],
      function (code, stdout) {
        assert.equal(stdout.indexOf('# node:\n'
          + '1..1\n'
          + 'not ok 1 test times out\n'), 0);
        assert.equal(code, 1);
        done();
      });
  });

  it('uses tdd ui', function (done) {
    run('ui-tdd', ['--node', '-R', 'tap', '--ui', 'tdd'],
      function (code, stdout) {
        assert.equal(stdout, '# node:\n'
          + '1..1\n'
          + 'ok 1 test passes\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n');
        assert.equal(code, 0);
        done();
      });
  });

  it('enables color', function (done) {
    run('passes', ['--node', '-R', 'dot', '--colors'],
      function (code, stdout) {
        assert.equal(stdout.trim().split('\n')[3], '  \u001b[90m.\u001b[0m');
        assert.equal(code, 0);
        done();
      });
  });

  it('passes transform to browserify', function (done) {
    run('passes', ['--node', '-R', 'tap', '--transform',
        '../transform.js'], function (code, stdout) {
      var lines = stdout.split('\n');
      assert.equal(lines[0], 'passes/test/passes.js');
      assert.equal(code, 0);
      done();
    });
  });

  it('passes transform with options to browserify', function (done) {
    run('passes', ['--node', '-R', 'tap', '--transform', '[',
        '../transform.js', '-x', ']'], function (code, stdout) {
      var lines = stdout.split('\n');
      assert(JSON.parse(lines[1]).x);
      assert.equal(code, 0);
      done();
    });
  });

  it('passes multiple transforms to browserify', function (done) {
    run('passes', ['--node', '-R', 'tap', '--transform',
        '../transform.js', '--transform',
        '../transform.js'], function (code, stdout) {
      var lines = stdout.split('\n');
      assert.equal(lines[0], 'passes/test/passes.js');
      assert.equal(lines[2], 'passes/test/passes.js');
      assert.equal(code, 0);
      done();
    });
  });

  it('passes plugin to browserify', function (done) {
    run('passes', ['--node', '-R', 'tap', '--plugin',
        '../plugin.js'], function (code, stdout) {
      var lines = stdout.split('\n');
      assert.equal(lines[0], 'passes/test/passes.js');
      assert.equal(code, 0);
      done();
    });
  });

  it('passes plugin with options to browserify', function (done) {
    run('passes', ['--node', '-R', 'tap', '--plugin', '[',
        '../plugin.js', '-x', ']'], function (code, stdout) {
      var lines = stdout.split('\n');
      assert(JSON.parse(lines[1]).x);
      assert.equal(code, 0);
      done();
    });
  });

  it('passes multiple plugins to browserify', function (done) {
    run('passes', ['--node', '-R', 'tap', '--plugin', '../plugin.js',
        '--plugin', '../plugin.js'], function (code, stdout) {
      var lines = stdout.split('\n');
      assert.equal(lines[0], 'passes/test/passes.js');
      assert.equal(lines[2], 'passes/test/passes.js');
      assert.equal(code, 0);
      done();
    });
  });

  it('requires file', function (done) {
    run('passes', ['--node', '-R', 'tap', '-r', '../required'],
      function (code, stdout) {
        assert.equal(stdout.split('\n')[1], 'required');
        assert.equal(code, 0);
        done();
      });
  });

  it('passes extension to browserify', function (done) {
    run('extension', ['--node', '-R', 'tap', '--extension', '.coffee'],
      function (code, stdout) {
        var lines = stdout.split('\n');
        assert.equal(lines[1], 'coffeescript');
        assert.equal(code, 0);
        done();
      });
  });

  it('passes multiple extensions to browserify', function (done) {
    run('extension-multiple', ['--node', '-R', 'tap', '--extension', '.coffee',
      '--extension', '.ts'], function (code, stdout) {
      var lines = stdout.split('\n');
      assert.equal(lines[1], 'coffeescript');
      assert.equal(lines[2], 'typescript');
      assert.equal(code, 0);
      done();
    });
  });

  it('passes recursive', function (done) {
    run('recursive', ['--node', '-R', 'tap', '--recursive'],
      function (code, stdout) {
        assert.equal(stdout, '# node:\n'
          + '1..1\n'
          + 'ok 1 recursive passes\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n');
        assert.equal(code, 0);
        done();
      });
  });

  // This test case fails on node 0.10 only. The corresponding phantomjs test
  // passes on node 0.10 and 0.12.
  it.skip('shows unicode diff', function (done) {
    run('unicode', ['--node', '-R', 'tap'], function (code, stdout) {
      assert.equal(stdout.indexOf('# node:\n'
        + '1..1\n'
        + 'not ok 1 unicode prints diff\n'
        + '  AssertionError: \'€\' == \'3\''), 0);
      assert.equal(code, 1);
      done();
    });
  });

});
