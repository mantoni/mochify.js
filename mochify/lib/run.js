'use strict';

const { fromSource, removeComments } = require('convert-source-map');
const { injectScript } = require('./inject-script');
const { injectModules } = require('./inject-modules');
const { stackMapper } = require('./stack-mapper');
const { pollEvents } = require('./poll-events');
const { mochaEventAdapter } = require('./mocha-event-adapter');

exports.run = run;

async function run(driver, mocha_runner, source) {
  let mapStack = null;
  if (Array.isArray(source)) {
    await injectModules(driver, source);
  } else {
    const source_map = fromSource(source);
    if (source_map) {
      mapStack = stackMapper(source_map.toObject());
      source = removeComments(source);
    }
    await injectScript(driver, source);
  }

  const emit = mochaEventAdapter(mocha_runner, mapStack);
  return pollEvents(driver, emit);
}
