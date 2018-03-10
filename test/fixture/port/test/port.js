/*global describe, it, location*/
'use strict';

var assert = require('assert');

describe('port', function () {
  it('passes after printing protocol and port', function () {
    console.log('location.protocol = ' + location.protocol);
    console.log('location.port = ' + location.port);
    assert(true);
  });
});
