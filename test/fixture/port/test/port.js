/*global describe, it, location*/
'use strict';

var assert = require('assert');

describe('port', function () {
  it('passes after printing location info', function () {
    console.log('location.protocol = ' + location.protocol);
    console.log('location.hostname = ' + location.hostname);
    console.log('location.port = ' + location.port);
    console.log('location.pathname = ' + location.pathname);
    assert(true);
  });
});
