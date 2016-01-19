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
var trace  = require('../lib/trace');


describe('trace', function () {
  var stream;
  var out;

  beforeEach(function () {
    out = '';
    stream = trace();
    stream.on('data', function (data) {
      out += data;
    });
  });

  it('removes unix mocha path', function () {
    stream.write('    at fail (/test/node_modules/mocha/x:7)\n');

    assert.equal(out, '');
  });

  it('makes relative unix assert path', function () {
    stream.write('    at fail (/test/node_modules/assert/x:7)\n');

    assert(out.match(/^ {4}at fail \((..\/)+test\/node_modules\/assert\/x:7/),
        out);
  });

  it('removes windows mocha path', function () {
    stream.write('    at fail (C:/test/node_modules/mocha/x:7)\n');

    assert.equal(out, '');
  });

  it('makes relative windows assert path', function () {
    var line = '    at fail (C:/test/node_modules/assert/x:7)\n';

    stream.write(line);

    assert(out.match(/^ {4}at fail \((..\/)+test\/node_modules\/assert\/x:7/),
        out);
  });

  it('removes relative unix mocha path', function () {
    stream.write('    at fail (node_modules/mocha/x:7)\n');

    assert.equal(out, '');
  });

});
