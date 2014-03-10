/*global describe, it*/
'use strict';

describe('test', function () {

  function that(val) {
    if (val) {
      return 42;
    }
  }

  it('does not cover', function () {
    that(false);
  });

});
