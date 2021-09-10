'use strict';

const jsdom = require('jsdom');

exports.mochifyDriver = mochifyDriver;

function mochifyDriver(options = {}) {
  const stderr = options.stderr || process.stderr;

  const virtual_console = new jsdom.VirtualConsole();
  const { window } = new jsdom.JSDOM(
    '<!DOCTYPE html>\n<html><body></body></html>',
    {
      url: options.url || 'http://localhost',
      virtualConsole: virtual_console,
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      strictSSL: false
    }
  );

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

  return Promise.resolve({
    evaluate,
    evaluateReturn: evaluate,
    end
  });
}
