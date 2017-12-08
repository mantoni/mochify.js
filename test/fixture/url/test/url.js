/*global describe, it, document, location*/
'use strict';

var assert = require('assert');

describe('url', function () {

  it('has H1 element', function () {
    console.log('location.href = ' + location.href);

    assert.equal(document.querySelector('h1').textContent, 'Oh, hi!');
  });

});
