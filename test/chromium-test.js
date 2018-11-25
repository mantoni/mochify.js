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
var net = require('net');
var run = require('./fixture/run');
var sandbox = require('./fixture/sandbox');


describe('chromium', function () {
  this.timeout(8000);

  it('passes', function (done) {
    run('passes', ['-R', 'tap'], function (code, stdout) {
      assert.equal(stdout, '# chromium:\n'
        + '1..1\n'
        + 'ok 1 test passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('fails if `it` throws', function (done) {
    run('fails', ['-R', 'tap'], function (code, stdout) {
      assert.equal(stdout.indexOf('# chromium:\n'
        + '1..1\n'
        + 'not ok 1 test fails\n'), 0);
      assert.equal(code, 1);
      done();
    });
  });

  it('fails if `describe` throws', function (done) {
    run('describe-throws', ['-R', 'tap'], function (code, stdout) {
      assert.equal(stdout.indexOf('# chromium:\n'
        + 'Evaluation failed: Error: Oh noes!\n'), 0);
      assert.equal(code, 1);
      done();
    });
  });

  it('handles async failures', function (done) {
    run('fails-async', ['-R', 'tap'], function (code, stdout) {
      assert.equal(code, 1);

      var lines = stdout.trim();
      var expectedStart = '# chromium:\n'
        + '1..4\n'
        + 'ok 1 test passes asynchronously\n'
        + 'not ok 2 test fails asynchronously';
      assert.equal(lines.indexOf(expectedStart), 0);
      // The stack trace output for async errors is slightly unpredictable
      // so we need to skip an assertion for the actual error.
      // See issue: https://github.com/mantoni/mochify.js/issues/92
      var expectedEnd = 'ok 3 test passes synchronously\n'
        + 'ok 4 test passes asynchronously once more\n'
        + '# tests 4\n'
        + '# pass 3\n'
        + '# fail 1';
      assert.equal(
        lines.indexOf(expectedEnd),
        lines.length - expectedEnd.length
      );

      done();
    });
  });

  it('coverage tap', function (done) {
    run('passes', ['--cover', '-R', 'tap'], function (code, stdout, stderr) {
      assert.equal(stdout, '# chromium:\n'
        + '1..1\n'
        + 'ok 1 test passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n');
      assert.equal(stderr, '# coverage: 8/8 (100.00 %)\n\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('coverage dot', function (done) {
    run('passes', ['--cover', '--no-colors', '-R', 'dot'],
      function (code, stdout, stderr) {
        var lines = stdout.trim().split(/\n+/);
        assert.equal(lines[0], '# chromium:');
        assert.equal(lines[1], '  .');
        assert.equal(stderr, '# coverage: 8/8 (100.00 %)\n\n');
        assert.equal(code, 0);
        done();
      });
  });

  it('times out', function (done) {
    run('timeout', ['-R', 'tap', '--timeout', '10'], function (code, stdout) {
      var lines = stdout.trim().split(/\n+/);
      assert.equal(lines[0], '# chromium:');
      assert.equal(lines[1], '1..1');
      assert.equal(lines[2], 'not ok 1 test times out');
      assert.equal(code, 1);
      done();
    });
  });

  it('uses tdd ui', function (done) {
    run('ui-tdd', ['-R', 'tap', '--ui', 'tdd'], function (code, stdout) {
      assert.equal(stdout, '# chromium:\n'
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
    run('passes', ['-R', 'dot', '--colors'], function (code, stdout) {
      assert.equal(stdout.trim().split('\n')[3], '  \u001b[90m.\u001b[0m');
      assert.equal(code, 0);
      done();
    });
  });

  it('uses custom chrome', function (done) {
    run('passes', ['--chrome', 'some/path'], function (code, stdout, stderr) {
      assert.equal(stdout, '');
      assert.equal(stderr.indexOf('Error: Failed to launch chrome!'), 0);
      assert.notEqual(code, 0);
      done();
    });
  });

  it('requires file', function (done) {
    run('require', ['-R', 'tap', '-r', '../required'], function (code, stdout) {
      assert.equal(stdout.split('\n')[2], 'required');
      assert.equal(code, 0);
      done();
    });
  });

  it('passes recursive', function (done) {
    run('recursive', ['-R', 'tap', '--recursive'], function (code, stdout) {
      assert.equal(stdout, '# chromium:\n'
        + '1..1\n'
        + 'ok 1 recursive passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('passes transform to browserify', function (done) {
    run('passes', ['-R', 'tap', '--transform', '../transform.js'],
      function (code, stdout) {
        var lines = stdout.split('\n');
        assert.equal(lines[0], 'passes/test/passes.js');
        assert.equal(code, 0);
        done();
      });
  });

  it('passes transform with options to browserify', function (done) {
    run('passes', ['-R', 'tap', '--transform', '[',
      '../transform.js', '-x', ']'], function (code, stdout) {
        var lines = stdout.split('\n');
        assert(JSON.parse(lines[1]).x);
        assert.equal(code, 0);
        done();
      });
  });

  it('passes multiple transforms to browserify', function (done) {
    run('passes', ['-R', 'tap', '--transform',
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
    run('passes', ['-R', 'tap', '--plugin',
      '../plugin.js'], function (code, stdout) {
        var lines = stdout.split('\n');
        assert.equal(lines[0], 'passes/test/passes.js');
        assert.equal(code, 0);
        done();
      });
  });

  it('passes plugin with options to browserify', function (done) {
    run('passes', ['-R', 'tap', '--plugin', '[',
      '../plugin.js', '-x', ']'], function (code, stdout) {
        var lines = stdout.split('\n');
        assert(JSON.parse(lines[1]).x);
        assert.equal(code, 0);
        done();
      });
  });

  it('passes multiple plugins to browserify', function (done) {
    run('passes', ['-R', 'tap', '--plugin', '../plugin.js',
      '--plugin', '../plugin.js'], function (code, stdout) {
        var lines = stdout.split('\n');
        assert.equal(lines[0], 'passes/test/passes.js');
        assert.equal(lines[2], 'passes/test/passes.js');
        assert.equal(code, 0);
        done();
      });
  });


  it('shows unicode diff', function (done) {
    run('unicode', ['-R', 'tap'], function (code, stdout) {
      assert.equal(stdout.indexOf('# chromium:\n'
        + '1..1\n'
        + 'not ok 1 unicode prints diff\n'), 0);
      assert.equal(code, 1);
      done();
    });
  });

  it('shows console output', function (done) {
    run('console', ['-R', 'tap'], function (code, stdout, stderr) {
      assert.equal(stdout, '# chromium:\n'
        + '1..4\n'
        + 'log\n'
        + 'ok 1 console log\n'
        + 'info\n'
        + 'ok 2 console info\n'
        + 'warn\n'
        + 'ok 3 console warn\n'
        + 'ok 4 console error\n'
        + '# tests 4\n'
        + '# pass 4\n'
        + '# fail 0\n');
      assert.equal(stderr, 'error\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('supports --outfile', sandbox(function (done, tmpdir) {
    var outfile = tmpdir + '/report.txt';
    run('passes', ['-R', 'tap', '--outfile', outfile],
      function (code, stdout) {
        assert.equal(code, 0);
        assert.equal(stdout, '');
        assert.equal(fs.readFileSync(outfile, 'utf8'), '# chromium:\n'
          + '1..1\n'
          + 'ok 1 test passes\n'
          + '# tests 1\n'
          + '# pass 1\n'
          + '# fail 0\n');
        done();
      });
  }));

  it('runs tests in the context of the given URL', function (done) {
    var url = 'file://' + __dirname + '/fixture/url/test.html';
    run('url', ['-R', 'tap', '--url', url], function (code, stdout) {
      assert.equal(stdout, '# chromium:\n'
        + '1..1\n'
        + 'location.href = ' + url + '\n'
        + 'ok 1 url has H1 element\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('runs tests in the context of a localhost https server with URL and port',
    function (done) {
      var url = 'https://localhost:8080/test.html';
      run('url', ['-R', 'tap', '--https-server', '8080', '--url', url],
        function (code, stdout) {
          assert.equal(stdout, '# chromium:\n'
            + '1..1\n'
            + 'location.href = ' + url + '\n'
            + 'ok 1 url has H1 element\n'
            + '# tests 1\n'
            + '# pass 1\n'
            + '# fail 0\n');
          assert.equal(code, 0);
          done();
        });
    });

  it('runs tests in the context of a localhost https server with URL only',
    function (done) {
      var url = 'https://localhost:7070/test.html';
      run('url', ['-R', 'tap', '--url', url],
        function (code, stdout) {
          assert.equal(stdout, '# chromium:\n'
            + '1..1\n'
            + 'location.href = ' + url + '\n'
            + 'ok 1 url has H1 element\n'
            + '# tests 1\n'
            + '# pass 1\n'
            + '# fail 0\n');
          assert.equal(code, 0);
          done();
        });
    });

  it('runs tests in the context of a localhost https server with port only',
    function (done) {
      run('url', ['-R', 'tap', '--https-server', '8080'],
        function (code, stdout, stderr) {
          assert.equal(stdout, '# chromium:\n'
            + '1..1\n'
            + 'location.href = https://localhost:8080/\n'
            + 'not ok 1 url has H1 element\n'
            + '  TypeError: Cannot read property \'textContent\' of null\n'
            + '      at Context.<anonymous> (test/url.js:11)\n'
            + '# tests 1\n'
            + '# pass 0\n'
            + '# fail 1\n');
          assert.notEqual(stderr.split('\n').indexOf('Error: Exit 1'), -1);
          assert.equal(code, 1);
          done();
        });
    });

  it('runs tests in the context of a localhost https server with random port',
    function (done) {
      run('port', ['-R', 'tap', '--https-server'],
        function (code, stdout) {
          assert.equal(code, 0);
          var lines = stdout.split('\n');
          var expected = [
            /^# chromium:$/,
            /^1\.\.1$/,
            /^location\.protocol = https:$/,
            /^location\.hostname = localhost$/,
            /^location\.port = \d{1,5}$/,
            /^location\.pathname = \//,
            /^ok 1 port passes after printing location info$/,
            /^# tests 1$/,
            /^# pass 1$/,
            /^# fail 0$/
          ];
          expected.forEach(function (re, index) {
            assert(
              re.test(lines[index]),
              'Unexpected line ' + index + ': ' + lines[index]
            );
          });
          done();
        });
    });

  it('runs tests in the context of a localhost https server with naked url',
    function (done) {
      run('port', ['-R', 'tap', '--url', 'https://localhost/index.html'],
        function (code, stdout) {
          assert.equal(code, 0);
          var lines = stdout.split('\n');
          var expected = [
            /^# chromium:$/,
            /^1\.\.1$/,
            /^location\.protocol = https:$/,
            /^location\.hostname = localhost$/,
            /^location\.port = \d{1,5}$/,
            /^location\.pathname = \/index.html$/,
            /^ok 1 port passes after printing location info$/,
            /^# tests 1$/,
            /^# pass 1$/,
            /^# fail 0$/
          ];
          expected.forEach(function (re, index) {
            assert(
              re.test(lines[index]),
              'Unexpected line ' + index + ': ' + lines[index]
            );
          });
          done();
        });
    });

  context('https-server with a port value given', function () {
    var server;

    before(function (done) {
      server = net.createServer();
      server.listen(3001, function (err) {
        done(err);
      });
    });

    after(function () {
      server.close();
    });

    it('creates a meaningful error when the port is already in use',
        function (done) {
          run('port', ['--https-server', '3001'],
            function (code, stdout, stderr) {
              assert.notEqual(
                stderr.indexOf('EADDRINUSE'), -1,
                'Error message did not contain error code'
              );
              assert.notEqual(stderr.indexOf('3001'), -1,
                'Error message did not contain port value'
              );
              assert.equal(code, 1);
              done();
            });
        });
  });
});
