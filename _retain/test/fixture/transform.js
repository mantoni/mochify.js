'use strict';

var through = require('through2');
var path = require('path');


function transform(file, opts) {
  delete opts._flags;
  console.log(path.relative(__dirname, file));
  console.log(JSON.stringify(opts));
  return through(function (chunk, enc, next) {
    /*jslint unparam: true*/
    this.push(chunk);
    next();
  });
}

module.exports = transform;
