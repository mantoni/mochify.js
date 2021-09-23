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
          cwd: path.join(__dirname, 'fixture')
        }
      );
    } catch (error) {
      return error;
    }
  }

  it('passes', async function () {
    if (!process.env.CI && !(await pingSelenium())) {
      this.skip();
    }

    const result = await run('passes.js');

    assert.isFalse(result.failed);
    const json = JSON.parse(result.stdout);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test passes');
  });

  it('reads from stdin', async function () {
    if (!process.env.CI && !(await pingSelenium())) {
      this.skip();
    }

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
    const json = JSON.parse(result.stdout);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test passes');
  });

  it('fails', async function () {
    if (!process.env.CI && !(await pingSelenium())) {
      this.skip();
    }

    const result = await run('fails.js');

    assert.isTrue(result.failed);
    const json = JSON.parse(result.stdout);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test fails');
  });

  it('does not leak client functions into global scope', async function () {
    if (!process.env.CI && !(await pingSelenium())) {
      this.skip();
    }

    const result = await run('client-leak.js');

    assert.isFalse(result.failed);
    const json = JSON.parse(result.stdout);
    assert.equals(json.tests.length, 1);
    assert.equals(
      json.tests[0].fullTitle,
      'test does not leak client functions into global scope'
    );
  });
});

function pingSelenium() {
  return new Promise((resolve) => {
    http
      .get('http://localhost:4444/wd/hub/status', () => {
        resolve(true);
      })
      .on('error', () => {
        resolve(false);
      });
  });
}
