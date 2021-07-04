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
var fs = require('fs');
var run = require('./fixture/run');
var sandbox = require('./fixture/sandbox');


describe('node', function () {

  it('passes', function (done) {
    run('passes', ['--node', '-R', 'tap'], function (code, stdout) {
      assert.equal(stdout, '# node:\n'
        + 'ok 1 test passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n'
        + '1..1\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('fails and continues if `it` throws', function (done) {
    run('fails', ['--node', '-R', 'tap'], function (code, stdout) {
      assert.equal(code, 1);

      var lines = stdout.trim().split(/\n+/);
      assert.equal(lines[0], '# node:');
      assert.equal(lines[1], 'not ok 1 test fails synchronously');
      assert.equal(lines[3], '  Error: Oh noes!');
      var p = lines.indexOf('not ok 2 test fails asynchronously');
      assert.notEqual(p, -1);
      assert.equal(lines[p + 2], '  Error: Oh noes!');
      p = lines.indexOf('ok 3 test passes synchronously', p + 2);
      assert.notEqual(p, -1);
      assert.equal(lines[p + 1], 'ok 4 test passes asynchronously');
      assert.equal(lines[p + 2], '# tests 4');
      assert.equal(lines[p + 3], '# pass 2');
      assert.equal(lines[p + 4], '# fail 2');
      assert.equal(lines[p + 5], '1..4');
      done();
    });
  });

  it('fails and exits if `describe` throws', function (done) {
    run('describe-throws', ['--node', '-R', 'tap'], function (code, stdout) {
      assert.equal(stdout.indexOf('# node:'), 0);
      assert.equal(stdout.indexOf('i should not show up'), -1);
      assert.equal(code, 1);
      done();
    });
  });

  it('coverage tap', function (done) {
    run('passes', ['--node', '--cover', '-R', 'tap'],
      function (code, stdout, stderr) {
        assert.equal(stdout, '# node:\n'
          + 'ok 1 test passes\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n'
          + '1..1\n');
        assert.equal(stderr, '# coverage: 8/8 (100.00 %)\n\n');
        assert.equal(code, 0);
        done();
      });
  });

  it('coverage dot', function (done) {
    run('passes', ['--node', '--cover', '--no-colors', '-R', 'dot'],
      function (code, stdout, stderr) {
        var lines = stdout.trim().split(/\n+/);
        assert.equal(lines[0], '# node:');
        assert.equal(lines[1], '  .');
        assert.equal(stderr, '# coverage: 8/8 (100.00 %)\n\n');
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
      function (code, stdout, stderr) {
        assert.equal(stdout, '# node:\n'
          + 'ok 1 test does not cover\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n'
          + '1..1\n');
        var coverOut = '\n# coverage: 9/10 (90.00 %)\n\nError: Exit 1\n\n';
        assert.equal(stderr.substring(stderr.length - coverOut.length),
          coverOut);
        assert.equal(code, 1);
        done();
      });
  });

  it('times out', function (done) {
    run('timeout', ['--node', '-R', 'tap', '--timeout', '10'],
      function (code, stdout) {
        assert.equal(stdout.indexOf('# node:\n'
          + 'not ok 1 test times out\n'), 0);
        assert.equal(code, 1);
        done();
      });
  });

  it('uses tdd ui', function (done) {
    run('ui-tdd', ['--node', '-R', 'tap', '--ui', 'tdd'],
      function (code, stdout) {
        assert.equal(stdout, '# node:\n'
          + 'ok 1 test passes\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n'
          + '1..1\n');
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
    run('passes', ['--node', '-R', 'tap', '--transform', '../transform.js'],
      function (code, stdout) {
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
    run('require', ['--node', '-R', 'tap', '-r', '../required'],
      function (code, stdout) {
        var lines = stdout.split('\n');
        assert.equal(lines[1], 'required');
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
          + 'ok 1 recursive passes\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n'
          + '1..1\n');
        assert.equal(code, 0);
        done();
      });
  });

  it('passes non-default recursive', function (done) {
    run('recursive', ['--node', '-R', 'tap', '--recursive', 'other'],
      function (code, stdout) {
        assert.equal(stdout, '# node:\n'
          + 'ok 1 other recursive passes\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n'
          + '1..1\n');
        assert.equal(code, 0);
        done();
      });
  });

  it('passes non-default recursive with trailing /*.js', function (done) {
    run('recursive', ['--node', '-R', 'tap', '--recursive', 'other/*.js'],
      function (code, stdout) {
        assert.equal(stdout, '# node:\n'
          + 'ok 1 other recursive passes\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n'
          + '1..1\n');
        assert.equal(code, 0);
        done();
      });
  });

  it('passes browser-field', function (done) {
    run('browser-field', ['--node', '-R', 'tap'],
      function (code, stdout) {
        assert.equal(stdout, '# node:\n'
          + 'ok 1 browser-field passes in browser\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n'
          + '1..1\n');
        assert.equal(code, 0);
        done();
      });
  });

  it('fails browser-field with --browser-field disabled', function (done) {
    run('browser-field', ['--node', '-R', 'tap', '--no-browser-field'],
      function (code, stdout) {
        assert.equal(stdout.indexOf('# node:\n'
          + 'not ok 1 browser-field passes in browser\n'
          + '  Error'), 0);
        assert.equal(code, 1);
        done();
      });
  });

  // This test case passes on node 6 but fails on node 8 and 10. The
  // corresponding chromium test also passes.
  it.skip('shows unicode diff', function (done) {
    run('unicode', ['--node', '-R', 'tap'], function (code, stdout) {
      assert.equal(stdout.indexOf('# node:\n'
        + 'not ok 1 unicode prints diff\n'
        + '  AssertionError: \'€\' == \'3\''), 0);
      assert.equal(code, 1);
      done();
    });
  });

  it('fails external', function (done) {
    run('external', ['--node', '-R', 'tap'],
      function (code, stdout, stderr) {
        console.log(stderr);
        assert.notEqual(
          stderr.indexOf('Cannot find module \'unresolvable\''),
          -1);
        assert.equal(code, 1);
        done();
      });
  });

  it('passes external with --external enabled', function (done) {
    run('external', ['--node', '-R', 'tap', '--external', 'unresolvable'],
      function (code, stdout) {
        assert.equal(stdout, '# node:\n'
          + 'ok 1 test external\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n'
          + '1..1\n');
        assert.equal(code, 0);
        done();
      });
  });

  it('supports --outfile', sandbox(function (done, tmpdir) {
    var outfile = tmpdir + '/report.txt';
    run('passes', ['--node', '-R', 'tap', '--outfile', outfile],
      function (code, stdout) {
        assert.equal(code, 0);
        assert.equal(stdout, '');
        assert.equal(fs.readFileSync(outfile, 'utf8'), '# node:\n'
          + 'ok 1 test passes\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n'
          + '1..1\n');
        done();
      });
  }));

  it('supports --mocha-path', sandbox(function (done) {
    var mochaPath = './node_modules/mocha';
    run('passes', ['--node', '-R', 'tap', '--mocha-path', mochaPath],
      function (code, stdout) {
        assert.equal(stdout, '# node:\n'
        + 'ok 1 test passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n'
        + '1..1\n');
        assert.equal(code, 0);
        done();
      });
  }));
});
