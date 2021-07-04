'use strict';

const { SourceMapConsumer } = require('source-map');

exports.stackMapper = stackMapper;

const stack_re = new RegExp('([a-z0-9]+\\.html|\\[stdin\\]|about:blank|'
  + 'http:\\/\\/[a-z0-9\\-_\\.]+(:[0-9]+)?\\/[^:]+|'
  + 'file:[^:]+|Unknown script code|<anonymous>|'
  + '__puppeteer_evaluation_script__)'
  + ':(\\d+)(:\\d+)?(\\D*)$', 'i');

function stackMapper(map) {
  const consumer = new SourceMapConsumer(map);
  return (stack) => stack
    .split('\n')
    .map((line) => mapLine(consumer, line))
    .filter(Boolean)
    .join('\n');
}

function mapLine(consumer, line) {
  const match = stack_re.exec(line);
  if (!match) {
    return line;
  }
  const mapped = consumer.originalPositionFor({
    line: Number(match[3]),
    column: Number(match[4] ? match[4].substring(1) : 0)
  });
  if (!mapped.source) {
    return null;
  }
  const pre = line.substring(0, match.index).replace('@', ' ');
  return `${pre}${mapped.source}:${mapped.line}${match[5]}`;
}
