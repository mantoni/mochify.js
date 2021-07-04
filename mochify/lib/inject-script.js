'use strict';

exports.injectScript = injectScript;

const MAX_SCRIPT_CHUNK = 700 * 1000;

/*
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
 */
async function injectScript(driver, script) {
  let next_script = null;
  do {
    if (script.length > MAX_SCRIPT_CHUNK) {
      next_script = script.substring(MAX_SCRIPT_CHUNK);
      script = script.substring(0, MAX_SCRIPT_CHUNK);
    } else {
      next_script = null;
    }
    await driver.evaluate(`mocha.mochify_receive(${JSON.stringify(script)})`);
  } while (next_script);
  await driver.evaluate(`mocha.mochify_run()`);
}
