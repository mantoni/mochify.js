'use strict';

exports.pollEvents = pollEvents;

async function pollEvents(driver, emit) {
  for (;;) {
    const events = await driver.evaluate('mocha.mochify_pollEvents()');
    for (const [event, data] of events) {
      if (event === 'mochify.callback') {
        return data.code || 0; // stop polling
      }
      if (event.startsWith('console.')) {
        console[event.substring(8)](...data);
      } else {
        emit(event, data);
      }
    }
  }
}
