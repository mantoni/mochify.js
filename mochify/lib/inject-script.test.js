'use strict';

const { assert, sinon } = require('@sinonjs/referee-sinon');
const { injectScript } = require('./inject-script');

describe('mochify/lib/inject-script', () => {
  const MAX_SCRIPT_CHUNK = 700 * 1000;

  it('evaluates mochify_receive with given script', () => {
    const driver = {
      evaluate: sinon.fake.returns(sinon.promise()),
      end: () => Promise.resolve()
    };

    injectScript(driver, 'console.log("Hi!")');

    assert.calledOnceWith(
      driver.evaluate,
      'window.mocha.mochify_receive("console.log(\\"Hi!\\")")'
    );
  });

  it('evaluates mochify_run', async () => {
    const driver = {
      evaluate: sinon.fake.resolves(),
      end: () => Promise.resolve()
    };

    const promise = injectScript(driver, 'console.log("Hi!")');

    await assert.resolves(promise);
    assert.calledTwice(driver.evaluate);
    assert.calledWith(driver.evaluate, 'window.mocha.mochify_run()');
  });

  it('splits script into chunks and invokes mochify_receive twice', async () => {
    const driver = {
      evaluate: sinon.fake.resolves(),
      end: () => Promise.resolve()
    };

    const script = /** @type {string} */ ({
      length: MAX_SCRIPT_CHUNK + 1,
      substring: sinon.fake((from) => (from === 0 ? 'first' : 'second'))
    });

    const promise = injectScript(driver, script);

    await assert.resolves(promise);
    assert.calledTwice(script.substring);
    assert.calledWith(script.substring, 0, MAX_SCRIPT_CHUNK);
    assert.calledWith(script.substring, MAX_SCRIPT_CHUNK);
    assert.calledThrice(driver.evaluate);
    assert.calledWith(driver.evaluate, 'window.mocha.mochify_receive("first")');
    assert.calledWith(
      driver.evaluate,
      'window.mocha.mochify_receive("second")'
    );
    assert.calledWith(driver.evaluate, 'window.mocha.mochify_run()');
  });
});
