/*
 * mochify.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var through = require('through');
var resolve = require('resolve');
var spawn   = require('child_process').spawn;


function coverifySplit(coverifyIn) {
  var buf = '';
  return through(function (chunk) {
    var p;
    buf += chunk;
    while (buf.length > 4) {
      p = buf.indexOf('COVER');
      if (p === -1) {
        this.queue(buf.substring(0, buf.length - 5));
        buf = buf.substring(buf.length - 5);
        return;
      }
      if (p !== 0) {
        this.queue(buf.substring(0, p));
        buf = buf.substring(p);
      }
      p = buf.indexOf('\n');
      if (p === -1) {
        return;
      }
      coverifyIn.write(buf.substring(0, p + 1));
      buf = buf.substring(p + 1);
    }
  }, function () {
    if (buf.length) {
      this.queue(buf);
    }
    this.queue(null);
    coverifyIn.end();
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
    var c = spawn(coverifyBin);
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
