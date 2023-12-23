'use strict';

/**
 * @typedef {import('../driver').MochifyDriver} MochifyDriver
 */

exports.injectScript = injectScript;

const MAX_SCRIPT_CHUNK = 700 * 1000;

/**
 * This hack works around the following issues:
 *
 * https://github.com/mantoni/mochify.js/issues/110
 * https://bugs.chromium.org/p/chromedriver/issues/detail?id=402
 * https://github.com/sinonjs/sinon/issues/912
 *
 * Apparently the Chrome webdriver has a buffer limit somewhere around 1 MB.
 * Injecting scripts that are below a certain size works reliably, so we're
 * slicing the actual script into chunks, merge the parts in the browser and
 * then inject a script tag there.
 *
 * @param {MochifyDriver} driver
 * @param {string} script
 * @returns {Promise<void>}
 */
async function injectScript(driver, script) {
  do {
    let chunk;
    if (script.length > MAX_SCRIPT_CHUNK) {
      chunk = script.substring(0, MAX_SCRIPT_CHUNK);
      script = script.substring(MAX_SCRIPT_CHUNK);
    } else {
      chunk = script;
      script = '';
    }
    await driver.evaluate(
      `window.mocha.mochify_receive(${JSON.stringify(chunk)})`
    );
  } while (script);
  await driver.evaluate(`window.mocha.mochify_run()`);
}
