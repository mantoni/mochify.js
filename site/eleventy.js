'use strict';

const syntax_highlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = function (config) {
  // Default layout for all pages (available since 11ty v1):
  config.addGlobalData('layout', 'home');

  // Copy assets:
  config.addPassthroughCopy('assets');

  // Add syntax highlighting plugin:
  config.addPlugin(syntax_highlight);

  return {
    dir: {
      input: '.',
      output: `site/build`,
      includes: 'site/includes',
      layouts: 'site/layouts',
      data: 'site/data'
    }
  };
};
