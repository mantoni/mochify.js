'use strict';

const { fromSource, removeComments } = require('convert-source-map');
const { injectScript } = require('./inject-script');
const { stackMapper } = require('./stack-mapper');
const { pollEvents } = require('./poll-events');
const { mochaEventAdapter } = require('./mocha-event-adapter');

exports.run = run;

function run(driver, mocha_runner, script) {
  let mapStack = null;
  const source_map = fromSource(script);
  if (source_map) {
    mapStack = stackMapper(source_map.toObject());
    script = removeComments(script);
  }

  injectScript(driver, script);

  const emit = mochaEventAdapter(mocha_runner, mapStack);
  return pollEvents(driver, emit);
}
