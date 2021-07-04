'use strict';

const execa = require('execa');
const { parseArgsStringToArgv } = require('string-argv');

exports.resolveBundle = resolveBundle;

async function resolveBundle(command, files) {
  const [cmd, ...args] = parseArgsStringToArgv(command);

  const result = await execa(cmd, args.concat(files), {
    preferLocal: true
  });

  if (result.failed || result.killed) {
    throw new Error(result.shortMessage);
  }

  return result.stdout;
}
