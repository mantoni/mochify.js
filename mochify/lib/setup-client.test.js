'use strict';

const { assert } = require('@sinonjs/referee-sinon');
const { setupClient } = require('./setup-client');

describe('mochify/lib/setup-client', () => {
  it('returns the given script wrapped in a self-invoking function', () => {
    const result = setupClient('console.log("Test")');

    assert.equals(result, '(function(){console.log("Test")})()');
  });

  it('replaces MOCHIFY_UI comment with default "bdd"', () => {
    const result = setupClient('configure(/* MOCHIFY_UI */)');

    assert.equals(result, "(function(){configure('bdd')})()");
  });

  it('replaces MOCHIFY_UI comment with `ui` from config', () => {
    const result = setupClient('configure(/* MOCHIFY_UI */)', {
      ui: 'test'
    });

    assert.equals(result, "(function(){configure('test')})()");
  });

  it('replaces MOCHIFY_TIMEOUT comment with default 2000', () => {
    const result = setupClient('configure(/* MOCHIFY_TIMEOUT */)');

    assert.equals(result, '(function(){configure(2000)})()');
  });

  it('replaces MOCHIFY_TIMEOUT comment with `timeout` from config', () => {
    const result = setupClient('configure(/* MOCHIFY_TIMEOUT */)', {
      timeout: 1234
    });

    assert.equals(result, '(function(){configure(1234)})()');
  });
});
