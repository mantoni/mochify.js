'use strict';

var transform = require('./transform');

module.exports = function (b, opts) {
  b.transform(opts, transform);
};
