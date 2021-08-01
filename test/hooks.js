'use strict';

const { sinon } = require('@sinonjs/referee-sinon');

exports.mochaHooks = {
  afterEach() {
    sinon.restore();
  }
};
