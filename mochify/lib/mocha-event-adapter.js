'use strict';

const Mocha = require('mocha');
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING,
  EVENT_TEST_END,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END,
  EVENT_DELAY_BEGIN,
  EVENT_DELAY_END
} = Mocha.Runner.constants;

exports.mochaEventAdapter = mochaEventAdapter;

/**
 * @param {Mocha.Runner} runner
 * @param {(function(string): string) | null} mapStack
 * @returns {function(string, Object): void}
 */
function mochaEventAdapter(runner, mapStack) {
  /** @type {Record<string, function(Object): void>} */
  const event_handlers = {};

  function forward(event, process = identity) {
    event_handlers[event] = (json) => {
      runner.emit(event, process(json));
    };
  }

  forward(EVENT_RUN_BEGIN, processStart);
  forward(EVENT_SUITE_BEGIN);
  forward(EVENT_SUITE_END);
  forward(EVENT_DELAY_BEGIN);
  forward(EVENT_DELAY_END);
  forward(EVENT_TEST_PENDING, processTest);
  forward(EVENT_TEST_PASS, processTest);
  forward(EVENT_TEST_END, processTest);
  forward(EVENT_RUN_END, processEnd);

  event_handlers[EVENT_TEST_FAIL] = (json) => {
    const test = processTest(json);
    const err = new Error();
    copy(json.err, err);
    if (mapStack && json.err.stack) {
      err.stack = mapStack(json.err.stack);
    }
    test.err = err;
    runner.emit(EVENT_TEST_FAIL, test, err);
  };

  return (event, data) => {
    event_handlers[event](data);
  };
}

/**
 * @template T
 * @param {T} object
 * @returns {T}
 */
function identity(object) {
  return object;
}

/**
 * @param {Object} object
 * @returns {Object}
 */
function processTest(object) {
  const test = Object.create(object);
  test.duration = object.duration;
  test.fullTitle = () => object._fullTitle;
  test.titlePath = () => object._titlePath;
  test.currentRetry = () => object._currentRetry;
  test.slow = () => object._slow;
  return test;
}

/**
 * @param {Object} object
 * @returns {Object}
 */
function processStart(object) {
  object.start = new Date(object.start);
  return object;
}

/**
 * @param {Object} object
 * @returns {Object}
 */
function processEnd(object) {
  object.end = new Date(object.end);
  return object;
}

/**
 * @param {Object} from
 * @param {Object} to
 */
function copy(from, to) {
  for (const key of Object.keys(from)) {
    to[key] = from[key];
  }
}
