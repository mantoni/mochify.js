'use strict';

const { WebDriver } = require('webdriver');

exports.mochifyDriver = mochifyDriver;

const default_url = `file:${__dirname}/index.html`;

async function mochifyDriver(options = {}) {
  const { url } = options;
  delete options.url;

  const client = await WebDriver.newSession(
    Object.assign(
      {
        logLevel: 'warn',
        hostname: 'localhost',
        path: '/wd/hub',
        port: 4444,
        capabilities: {
          browserName: 'firefox'
        }
      },
      options
    )
  );

  await client.navigateTo(url || default_url);

  return {
    evaluate: (script) =>
      client.executeAsyncScript(
        `
          var __mochify_return_value = ${script};
          arguments[arguments.length - 1](__mochify_return_value)
        `,
        []
      ),
    end: () => client.deleteSession()
  };
}