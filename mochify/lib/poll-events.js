'use strict';

exports.pollEvents = pollEvents;

async function pollEvents(driver, emit) {
  const events = await driver.evaluate('mocha.mochify_pollEvents()');
  for (const [event, data] of events) {
    if (event === 'mochify.callback') {
      await driver.end();
      if (data.code) {
        process.exitCode = data.code;
      }
      return; // stop polling
    }
    if (event.startsWith('console.')) {
      console[event.substring(8)](...data);
    } else {
      emit(event, data);
    }
  }
  setTimeout(() => pollEvents(driver, emit), 100);
}
