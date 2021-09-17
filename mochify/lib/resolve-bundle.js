'use strict';

const fs = require('fs').promises;
const execa = require('execa');
const { parseArgsStringToArgv } = require('string-argv');

exports.resolveBundle = resolveBundle;

async function resolveBundle(command, resolved_spec) {
  if (
    typeof resolved_spec === 'object' &&
    typeof resolved_spec.pipe === 'function'
  ) {
    return bufferStream(resolved_spec);
  }

  if (!command) {
    return concatFiles(resolved_spec);
  }

  const [cmd, ...args] = parseArgsStringToArgv(command);

  const result = await execa(cmd, args.concat(resolved_spec), {
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

function bufferStream(stream) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    stream.on('data', (chunk) => buffers.push(chunk));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(buffers).toString('utf8')));
  });
}
