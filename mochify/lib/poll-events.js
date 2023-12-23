'use strict';

/**
 * @typedef {import('../driver').MochifyDriver} MochifyDriver
 */

exports.pollEvents = pollEvents;

/**
 * @param {MochifyDriver} driver
 * @param {function(string, Object): void} emit
 * @returns {Promise<number>}
 */
function pollEvents(driver, emit) {
  return new Promise((resolve) => {
    async function doPoll() {
      const events = await driver.evaluate('window.mocha.mochify_pollEvents()');
      if (!events) {
        setImmediate(doPoll);
        return;
      }

      for (const [event, data] of events) {
        if (event === 'mochify.callback') {
          resolve(data.code || 0);
          return;
        }
        if (event === 'mochify.coverage') {
          global.__coverage__ = data;
        } else if (event.startsWith('console.')) {
          console[event.substring(8)](...data);
        } else {
          emit(event, data);
        }
      }

      setImmediate(doPoll);
    }

    doPoll();
  });
}
