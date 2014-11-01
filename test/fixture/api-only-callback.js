'use strict';

var mochify = require('../../');

mochify(function () {
  process.exit(42);
});
