'use strict';

const driver = require('puppeteer');

exports.mochifyDriver = mochifyDriver;

const default_url = `file:${__dirname}/index.html`;

async function mochifyDriver(options = {}) {
  const stderr = options.stderr || process.stderr;

  const browser = await driver.launch({
    ignoreHTTPSErrors: true
    /*
    args: [
      '--allow-insecure-localhost',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security'
    ]
    */
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
