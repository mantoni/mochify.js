/*globals Mocha, mocha, window, document*/
/*eslint-disable no-var, prefer-arrow-callback, mocha/prefer-arrow-callback,
  object-shorthand, prefer-template*/
'use strict';

var constants = Mocha.Runner.constants;

var error_keys = [
  'name',
  'message',
  'stack',
  'code',
  'expected',
  'actual',
  'operator'
];
var test_keys = [
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

var hasOwnProperty = Object.prototype.hasOwnProperty;
var slice = Array.prototype.slice;

function copy(keys, from, to) {
  keys.forEach(function (key) {
    if (hasOwnProperty.call(from, key)) {
      to[key] = from[key];
    }
  });
}

var queue = [];

function pollEvents() {
  if (!queue.length) {
    return null;
  }
  var events = queue.slice();
  queue.length = 0;
  return events;
}

function write(event, data) {
  queue.push([event, data]);
}

function getTestData(test) {
  var json = {
    _fullTitle: test.fullTitle(),
    _titlePath: test.titlePath()
  };
  copy(test_keys, test, json);
  return json;
}

function forward(runner, event, processor) {
  runner.on(event, function (object, err) {
    write(event, processor(object, err));
  });
}

function MochifyReporter(runner) {
  var stats = runner.stats;

  forward(runner, constants.EVENT_RUN_BEGIN, function () {
    return {
      start: stats.start.toISOString()
    };
  });

  forward(runner, constants.EVENT_RUN_END, function () {
    return {
      end: stats.end.toISOString(),
      duration: stats.duration
    };
  });

  forward(runner, constants.EVENT_SUITE_BEGIN, function (suite) {
    return {
      root: suite.root,
      title: suite.title,
      pending: suite.pending,
      delayed: suite.delayed
    };
  });

  forward(runner, constants.EVENT_SUITE_END, function () {
    return {};
  });
  forward(runner, constants.EVENT_DELAY_BEGIN, function () {
    return {};
  });
  forward(runner, constants.EVENT_DELAY_END, function () {
    return {};
  });

  forward(runner, constants.EVENT_TEST_PASS, getTestData);
  forward(runner, constants.EVENT_TEST_PENDING, getTestData);
  forward(runner, constants.EVENT_TEST_FAIL, function (test, err) {
    var json = getTestData(test);
    json.err = {};
    copy(error_keys, err, json.err);
    return json;
  });
  forward(runner, constants.EVENT_TEST_END, getTestData);
}

mocha.reporter(MochifyReporter);
mocha.ui(/* MOCHIFY_UI */);
mocha.timeout(/* MOCHIFY_TIMEOUT */);
mocha.mochify_pollEvents = pollEvents;

var chunks = [];
mocha.mochify_receive = function (chunk) {
  chunks.push(chunk);
};
mocha.mochify_run = function () {
  // Inject script
  var s = document.createElement('script');
  s.type = 'text/javascript';
  s.textContent = chunks.join('');
  document.body.appendChild(s);
  // Run mocha
  mocha.run(function (code) {
    if (typeof __coverage__ !== 'undefined') {
      write('mochify.coverage', window.__coverage__);
    }
    write('mochify.callback', { code: code });
  });
};

['debug', 'log', 'info', 'warn', 'error'].forEach(function (name) {
  if (console[name]) {
    console[name] = function () {
      write('console.' + name, slice.call(arguments));
    };
  }
});

window.onerror = function (msg, file, line, column, err) {
  if (err) {
    console.error(err.stack);
  } else {
    console.error(msg + '\n    at ' + file + ':' + line + ':' + column);
  }
};
