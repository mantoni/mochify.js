'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { assert } = require('@sinonjs/referee-sinon');
const execa = require('execa');

describe('webdriver', () => {
  async function run(file, ...extra_args) {
    try {
      return await execa(
        '../../index.js',
        [file, '--driver', 'webdriver', ...extra_args],
        {
          cwd: path.join(__dirname, 'fixture'),
          stderr: process.stderr
        }
      );
    } catch (error) {
      return error;
    }
  }

  before(async function () {
    const selenium_running = await pingSelenium();
    if (!process.env.CI && !selenium_running) {
      this.skip();
    }
  });

  it('passes', async () => {
    const result = await run('passes.js');

    assert.isFalse(result.failed);
    const json = getResultStdoutAsJson(result);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test passes');
  });

  it('reads from stdin', async () => {
    let result;
    try {
      const cp = execa('../../index.js', ['--driver', 'webdriver', '-'], {
        cwd: path.join(__dirname, 'fixture')
      });
      const fixture = fs.createReadStream(
        path.resolve(__dirname, './fixture/passes.js')
      );
      fixture.pipe(cp.stdin);
      result = await cp;
    } catch (err) {
      result = err;
    }

    assert.isFalse(result.failed);
    const json = getResultStdoutAsJson(result);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test passes');
  });

  it('fails', async () => {
    const result = await run('fails.js');

    assert.isTrue(result.failed);
    const json = getResultStdoutAsJson(result);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test fails');
  });

  it('does not leak client functions into global scope', async () => {
    const result = await run('client-leak.js');

    assert.isFalse(result.failed);
    const json = getResultStdoutAsJson(result);
    assert.equals(json.tests.length, 1);
    assert.equals(
      json.tests[0].fullTitle,
      'test does not leak client functions into global scope'
    );
  });
});

function pingSelenium() {
  return new Promise((resolve, reject) => {
    http
      .get('http://localhost:4444/wd/hub/status', (res) => {
        res.on('data', () => {}); // consume request body
        if (res.statusCode !== 200) {
          reject(
            new Error(
              `Received unexpected ${res.statusCode} response from "/wd/hub/status"`
            )
          );
          return;
        }
        resolve(true);
      })
      .on('error', () => {
        resolve(false);
      });
  });
}

function getResultStdoutAsJson(result) {
  // At some point between v8.10 and v8.27 WebDriver started to log one line
  // with level INFO, even though the log level is set to "warn".
  //
  // 2023-12-22T14:01:31.855Z INFO @wdio/utils: Connecting to existing driver …
  return JSON.parse(result.stdout.substring(result.stdout.indexOf('{')));
}
