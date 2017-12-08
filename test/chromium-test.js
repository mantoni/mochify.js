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

  it('fails', function (done) {
    run('fails', ['-R', 'tap'], function (code, stdout) {
      assert.equal(stdout.indexOf('# chromium:\n'
        + '1..1\n'
        + 'not ok 1 test fails\n'), 0);
      assert.equal(code, 1);
      done();
    });
  });

  it('coverage tap', function (done) {
    run('passes', ['--cover', '-R', 'tap'], function (code, stdout) {
      assert.equal(stdout, '# chromium:\n'
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
    run('passes', ['--cover', '--no-colors', '-R', 'dot'],
      function (code, stdout) {
        var lines = stdout.trim().split(/\n+/);
        assert.equal(lines[0], '# chromium:');
        assert.equal(lines[1], '  .');
        assert.equal(lines[3], '# coverage: 8/8 (100.00 %)');
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
    run('passes', ['--chrome', 'some/path'], function (code, stdout) {
      assert.equal(stdout.indexOf('Error: Failed to launch chrome!'), 0);
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

  it('shows unicode diff', function (done) {
    run('unicode', ['-R', 'tap'], function (code, stdout) {
      assert.equal(stdout.indexOf('# chromium:\n'
        + '1..1\n'
        + 'not ok 1 unicode prints diff\n'), 0);
      assert.equal(code, 1);
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
        + 'location.href = file://' + __dirname + '/fixture/url/test.html\n'
        + 'ok 1 url has H1 element\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('runs tests in the context of a localhost https server with specified URL',
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

  it('runs tests in the context of a localhost https server with default URL',
    function (done) {
      run('url', ['-R', 'tap', '--https-server', '8080'],
        function (code, stdout) {
          assert.equal(stdout, '# chromium:\n'
            + '1..1\n'
            + 'location.href = https://localhost:8080/\n'
            + 'not ok 1 url has H1 element\n'
            + '  TypeError: Cannot read property \'textContent\' of null\n'
            + '      at Context.<anonymous> (test/url.js:11)\n'
            + '# tests 1\n'
            + '# pass 0\n'
            + '# fail 1\n'
            + 'Error: Exit 1\n\n');
          assert.equal(code, 1);
          done();
        });
    });

});
