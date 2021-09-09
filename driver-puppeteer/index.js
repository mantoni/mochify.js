'use strict';

const driver = require('puppeteer');

exports.mochifyDriver = mochifyDriver;

const default_url = `file:${__dirname}/index.html`;

async function mochifyDriver(options = {}) {
  const { stderr = process.stderr, ...launch_options } = options;

  // In case this arrives through CLI flags, yargs will pass a string
  // when a single arg is given and an Array of strings when multiple
  // args are given.
  const extra_args = [].concat(launch_options.args).filter(Boolean);
  launch_options.args = [
    '--allow-insecure-localhost',
    '--disable-dev-shm-usage',
    ...extra_args
  ];

  const browser = await driver.launch({
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

  await page.goto(options.url || default_url);

  function evaluate(script) {
    return page.evaluate(script);
  }

  return {
    evaluate,
    evaluateReturn: evaluate,
    end
  };
}
