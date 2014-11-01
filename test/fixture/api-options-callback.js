'use strict';

var mochify = require('../../');

mochify({
  node : true
}, function () {
  process.exit(42);
});
