'use strict';

const fs = require('fs').promises;
const execa = require('execa');
const { parseArgsStringToArgv } = require('string-argv');

exports.resolveBundle = resolveBundle;

async function resolveBundle(command, files) {
  if (command && files) {
    throw new Error(
      'Cannot use a stream as input when a bundle command is given.'
    );
  }

  if (typeof files === 'object' && typeof files.pipe === 'function') {
    return new Promise((resolve, reject) => {
      let buf;
      files.on('data', (data) => {
        buf += data;
      });
      files.on('error', (err) => {
        reject(err);
      });
      files.on('end', () => {
        resolve(buf);
      });
    });
  }

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
