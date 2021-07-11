'use strict';

const driver = require('playwright');

exports.mochifyDriver = mochifyDriver;

async function mochifyDriver(options = {}) {
  options = Object.assign(
    {
      engine: 'firefox',
      url: `file:${__dirname}/index.html`,
      stderr: process.stderr
    },
    options
  );

  const stderr = options.stderr;
  const browser = await driver[options.engine].launch({
    ignoreHTTPSErrors: true
  });

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

  await page.goto(options.url);

  function evaluate(script) {
    return page.evaluate(script);
  }

  return {
    evaluate,
    evaluateReturn: evaluate,
    end
  };
}
