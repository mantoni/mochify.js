'use strict';

const WebDriver = require('webdriver').default;

exports.mochifyDriver = mochifyDriver;

const default_url = `file:${__dirname}/index.html`;

async function mochifyDriver(options = {}) {
  const client = await WebDriver.newSession({
    logLevel: 'warn',
    hostname: 'localhost',
    path: '/wd/hub',
    port: 4444,
    capabilities: {
      browserName: 'safari'
    }
  });

  await client.navigateTo(options.url || default_url);

  return {
    evaluate: (script) => client.executeScript(script, []),
    evaluateReturn: (script) => client.executeScript(`return ${script}`, []),
    end: () => client.deleteSession()
  };
}
