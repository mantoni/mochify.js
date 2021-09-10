'use strict';

const fs = require('fs').promises;
const execa = require('execa');
const { parseArgsStringToArgv } = require('string-argv');

exports.resolveBundle = resolveBundle;

async function resolveBundle(command, files) {
  if (!command) {
    return concatFiles(files);
  }

  const [cmd, ...args] = parseArgsStringToArgv(command);

  const result = await execa(cmd, args.concat(files), {
    preferLocal: true
  });

  if (result.failed || result.killed) {
    throw new Error(result.shortMessage);
  }

  return result.stdout;
}

async function concatFiles(files) {
  const buffers = await Promise.all(files.map((file) => fs.readFile(file)));
  return Buffer.concat(buffers).toString('utf8');
}
