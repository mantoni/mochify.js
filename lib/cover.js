/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var through = require('through2');
var resolve = require('resolve');
var spawn   = require('child_process').spawn;


function coverifySplit(coverifyIn) {
  var buf = '';
  return through(function (chunk, enc, next) {
    /*jslint unparam: true*/
    var p, w = '';
    buf += chunk;
    while (buf.length > 4) {
      p = buf.indexOf('COVER');
      if (p === -1) {
        w += buf.substring(0, buf.length - 5);
        buf = buf.substring(buf.length - 5);
        break;
      }
      if (p !== 0) {
        w += buf.substring(0, p);
        buf = buf.substring(p);
      }
      p = buf.indexOf('\n');
      if (p === -1) {
        break;
      }
      coverifyIn.write(buf.substring(0, p + 1));
      buf = buf.substring(p + 1);
    }
    if (w) {
      this.push(w);
    }
    next();
  }, function (next) {
    if (buf.length) {
      this.push(buf);
    }
    coverifyIn.end();
    next();
  });
}

var coverifyBin = resolve.sync('coverify', {
  baseDir: __dirname,
  packageFilter: function (pkg) {
    return { main : pkg.bin.coverify };
  }
});

module.exports = function (b) {

  function apply() {
    var a = [coverifyBin];
    if (process.stderr.isTTY) {
      a.push('--color');
    }
    var c = spawn('node', a);
    c.stdout.pipe(process.stdout);
    c.stderr.pipe(process.stderr);
    c.on('exit', function (code) {
      if (code) {
        b.emit('error', new Error('Exit ' + code));
      }
    });
    b.pipeline.get('wrap').push(coverifySplit(c.stdin));
  }

  apply();
  b.on('reset', apply);

};
