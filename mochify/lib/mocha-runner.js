'use strict';

const EventEmitter = require('events');
const Mocha = require('mocha');
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING,
  EVENT_SUITE_BEGIN,
  EVENT_TEST_END
} = Mocha.Runner.constants;

exports.createMochaRunner = createMochaRunner;

class MochaRunner extends EventEmitter {
  constructor() {
    super();
    const stats = (this.stats = {
      suites: 0,
      tests: 0,
      passes: 0,
      pending: 0,
      failures: 0
    });
    this.on(EVENT_RUN_BEGIN, (json) => {
      stats.start = json.start;
    });
    this.on(EVENT_SUITE_BEGIN, (suite) => suite.root || stats.suites++);
    this.on(EVENT_TEST_PASS, () => stats.passes++);
    this.on(EVENT_TEST_FAIL, () => stats.failures++);
    this.on(EVENT_TEST_PENDING, () => stats.pending++);
    this.on(EVENT_TEST_END, () => stats.tests++);
    this.on(EVENT_RUN_END, (json) => {
      stats.end = json.end;
      stats.duration = stats.end - stats.start;
    });
  }
}

/**
 * @param {keyof Mocha.reporters} reporter
 * @returns {Mocha.Runner}
 */
function createMochaRunner(reporter) {
  const MochaReporter = Mocha.reporters[reporter];
  if (!MochaReporter) {
    throw new Error(`Invalid reporter "${reporter}"`);
  }

  const runner = /** @type {Mocha.Runner} */ (new MochaRunner());
  new MochaReporter(runner); // eslint-disable-line no-new
  return runner;
}
