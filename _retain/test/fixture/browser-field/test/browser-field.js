/*global describe, it*/
'use strict';

var someModule = require('some-module');

describe('browser-field', function () {

  it('passes in browser', function () {
    if (someModule !== 'browser') {
      throw new Error();
    }
  });

});
