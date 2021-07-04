/*globals Mocha, mocha, window, document*/
'use strict';

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

const error_keys = [
  'name',
  'message',
  'stack',
  'code',
  'expected',
  'actual',
  'operator'
];
const test_keys = [
  'title',
  'type',
  'state',
  'pending',
  'duration',
  'timedOut',
  'speed',
  '_slow',
  '_currentRetry'
];

const { hasOwnProperty } = Object.prototype;
const { slice } = Array.prototype;

function copy(keys, from, to) {
  for (const key of keys) {
    if (hasOwnProperty.call(from, key)) {
      to[key] = from[key];
    }
  }
}

const queue = [];
let pollResolve = null;

function pollEvents() {
  if (queue.length) {
    const events = queue.slice();
    queue.length = 0;
    return events;
  }
  return new Promise((resolve) => {
    pollResolve = resolve;
  });
}

function write(event, data) {
  const queue_entry = [event, data];
  if (pollResolve) {
    pollResolve([queue_entry]);
    pollResolve = null;
  } else {
    queue.push(queue_entry);
  }
}

function getTestData(test) {
  const json = {
    _fullTitle: test.fullTitle(),
    _titlePath: test.titlePath()
  };
  copy(test_keys, test, json);
  return json;
}

function forward(runner, event, processor) {
  runner.on(event, (object, err) => {
    write(event, processor(object, err));
  });
}

class MochifyReporter {
  constructor(runner) {
    const { stats } = runner;

    forward(runner, EVENT_RUN_BEGIN, () => ({
      start: stats.start.toISOString()
    }));

    forward(runner, EVENT_RUN_END, () => ({
      end: stats.end.toISOString(),
      duration: stats.duration
    }));

    forward(runner, EVENT_SUITE_BEGIN, (suite) => ({
      root: suite.root,
      title: suite.title,
      pending: suite.pending,
      delayed: suite.delayed
    }));

    forward(runner, EVENT_SUITE_END, () => ({}));
    forward(runner, EVENT_DELAY_BEGIN, () => ({}));
    forward(runner, EVENT_DELAY_END, () => ({}));

    forward(runner, EVENT_TEST_PASS, getTestData);
    forward(runner, EVENT_TEST_PENDING, getTestData);
    forward(runner, EVENT_TEST_FAIL, (test, err) => {
      const json = getTestData(test);
      json.err = {};
      copy(error_keys, err, json.err);
      return json;
    });
    forward(runner, EVENT_TEST_END, getTestData);
  }
}

mocha.reporter(MochifyReporter);
mocha.setup(/* MOCHIFY_UI */);
mocha.timeout(/* MOCHIFY_TIMEOUT */);
mocha.mochify_pollEvents = pollEvents;

const chunks = [];
mocha.mochify_receive = (chunk) => {
  chunks.push(chunk);
};
mocha.mochify_run = () => {
  // Inject script
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.textContent = chunks.join('');
  document.body.appendChild(s);
  // Run mocha
  mocha.run((code) => write('mochify.callback', { code }));
};

['debug', 'log', 'info', 'warn', 'error'].forEach((name) => {
  if (console[name]) {
    console[name] = function () {
      write(`console.${name}`, slice.call(arguments));
    };
  }
});

window.onerror = (msg, file, line, column, err) => {
  if (err) {
    console.error(err.stack);
  } else {
    console.error(`${msg}\n    at ${file}:${line}:${column}`);
  }
};
