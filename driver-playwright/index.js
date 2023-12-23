'use strict';

const driver = require('playwright');

/**
 * @typedef {import('../mochify').MochifyDriver} MochifyDriver
 */

exports.mochifyDriver = mochifyDriver;

/**
 * @param {Object} [options]
 * @returns {Promise<MochifyDriver>}
 */
async function mochifyDriver(options = {}) {
  const {
    stderr = process.stderr,
    engine = 'firefox',
    url = `file:${__dirname}/empty.html`,
    ...launch_options
  } = options;

  const browser = await driver[engine].launch(launch_options);

  const page = await browser.newPage();
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'log') {
      return;
    }

    const ignoreList = [
      'onmozfullscreenerror',
      'window.webkitStorageInfo',
      'onmozfullscreenchange'
    ];

    if (type === 'warning' && ignoreList.some((t) => text.includes(t))) {
      // Swallow deprecation warning.
      return;
    }
    stderr.write(text);
    stderr.write('\n');
  });

  page.on('error', (err) => {
    stderr.write(err.stack || String(err));
    stderr.write('\n');
    process.exitCode = 1;
    end();
  });

  async function end() {
    await page.close();
    await browser.close();
  }

  await page.goto(url);

  /**
   * @param {string} script
   * @returns {Promise<Object>}
   */
  function evaluate(script) {
    return page.evaluate(script);
  }

  return {
    evaluate,
    end
  };
}
