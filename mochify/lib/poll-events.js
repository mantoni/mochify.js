'use strict';

exports.pollEvents = pollEvents;

async function pollEvents(driver, emit) {
  let interval;
  const result = await new Promise((resolve) => {
    interval = setInterval(async () => {
      const events = await driver.evaluateReturn('mocha.mochify_pollEvents()');
      if (!events) {
        return;
      }
      for (const [event, data] of events) {
        if (event === 'mochify.callback') {
          resolve(data.code || 0);
          return; // stop polling
        }
        if (event === 'mochify.coverage') {
          global.__coverage__ = data;
        } else if (event.startsWith('console.')) {
          console[event.substring(8)](...data);
        } else {
          emit(event, data);
        }
      }
    }, 1);
  });
  clearInterval(interval);
  return result;
}
