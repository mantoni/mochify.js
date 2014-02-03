/*global describe, it*/
'use strict';

var spawn  = require('child_process').spawn;
var assert = require('assert');
var path   = require('path');

var bin = path.resolve(__dirname, '..', 'bin', 'cmd.js');


function run(test, callback) {
  var mochify = spawn(bin, ['-R', 'tap'], {
    cwd : path.resolve(__dirname, 'fixture', test)
  });

  var stdout = '';
  mochify.stdout.on('data', function (data) {
    stdout += data;
  });

  mochify.on('close', function (code) {
    callback(code, stdout);
  });
}


describe('phantom', function () {

  it('passes', function (done) {
    run('passes', function (code, stdout) {
      assert.equal(stdout, '1..1\n'
        + 'ok 1 test passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n');
      assert.equal(code, 0);
      done();
    });
  });

  it('fails', function (done) {
    run('fails', function (code, stdout) {
      assert.equal(stdout.indexOf('1..1\n'
        + 'not ok 1 test fails\n'
        + '  Error: Oh noes!'), 0);
      assert.equal(code, 1);
      done();
    });
  });
});
