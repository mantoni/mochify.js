'use strict';

var mochify = require('../../');

mochify({
  node : true
}).bundle(function () {
  process.exit(42);
});
