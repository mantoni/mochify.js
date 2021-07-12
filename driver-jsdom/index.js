'use strict';

const fs = require('fs/promises');
const path = require('path');
const jsdom = require('jsdom');

exports.mochifyDriver = mochifyDriver;

async function mochifyDriver(options = {}) {
  options = Object.assign(
    {
      url: path.resolve(__dirname, './index.html'),
      origin: 'http://localhost'
    },
    options
  );
  const stderr = options.stderr || process.stderr;

  const host_document = await fs.readFile(options.url);
  const virtual_console = new jsdom.VirtualConsole();

  const { window } = new jsdom.JSDOM(host_document, {
    runScripts: 'dangerously',
    url: options.origin,
    virtualConsole: virtual_console
  });

  function end() {
    return null;
  }

  virtual_console.on('jsdomError', (error) => {
    process.exitCode = 1;
    if (error && error.type === 'unhandled exception') {
      // These errors will be logged by the global onerror handler
      // in the client script, so there's no need to duplicate them here.
      return;
    }
    stderr.write(error.stack || String(error));
    stderr.write('\n');
  });

  function evaluate(script) {
    return Promise.resolve(window.eval(script));
  }

  return {
    evaluate,
    evaluateReturn: evaluate,
    end
  };
}
