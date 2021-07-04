'use strict';

module.exports = {
  '*.js': 'eslint --fix',
  '*.{js,json,md}': 'prettier --write'
};
