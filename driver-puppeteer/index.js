'use strict';

const driver = require('puppeteer');

/**
 * @typedef {import('node:stream').Writable} Writable
 * @typedef {import('puppeteer').PuppeteerLaunchOptions} PuppeteerLaunchOptions
 * @typedef {import('../mochify').MochifyDriver} MochifyDriver
 */

/**
 * @typedef {Object} PuppeteerDriverOptions
 * @property {string} [url]
 * @property {Writable} [stderr]
 */

exports.mochifyDriver = mochifyDriver;

/**
 * @param {PuppeteerDriverOptions & PuppeteerLaunchOptions} [options]
 * @returns {Promise<MochifyDriver>}
 */
async function mochifyDriver(options = {}) {
  const {
    url = `file:${__dirname}/index.html`,
    stderr = /** @type {Writable} */ (process.stderr),
    ...launch_options
  } = options;

  // In case this arrives through CLI flags, yargs will pass a string
  // when a single arg is given and an Array of strings when multiple
  // args are given.
  const extra_args = launch_options.args || [];
  launch_options.args = [
    '--allow-insecure-localhost',
    '--disable-dev-shm-usage',
    ...extra_args
  ];

  const browser = await driver.launch({
    headless: 'new',
    ignoreHTTPSErrors: true,
    // Workaround for https://github.com/puppeteer/puppeteer/issues/6957
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    ...launch_options
  });

  const page = await browser.newPage();
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'log') {
      return;
    }
    if (type === 'warning' && text.includes('window.webkitStorageInfo')) {
      // Swallow deprecation warning.
      return;
    }
    stderr.write(text);
    stderr.write('\n');
  });

  /**
   * @param {Error} err
   */
  function handlePuppeteerError(err) {
    stderr.write(err.stack || String(err));
    stderr.write('\n');
    process.exitCode = 1;
    end();
  }

  page.on('pageerror', handlePuppeteerError).on('error', handlePuppeteerError);

  async function end() {
    await page.close();
    await browser.close();
  }

  await page.goto(url);

  function evaluate(script) {
    return page.evaluate(script);
  }

  return {
    evaluate,
    end
  };
}
