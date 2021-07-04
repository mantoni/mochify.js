'use strict';

var mochify = require('../../');

mochify().bundle(function () {
  process.exit(42);
});
