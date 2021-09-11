'use strict';

const path = require('path');

exports.resolveModules = resolveModules;

function resolveModules(serve, files) {
  const server_root = path.resolve(process.cwd(), serve);
  const result = files.map((file_name) => {
    const abs_path = path.resolve(process.cwd(), file_name);
    const src = path.relative(server_root, abs_path);
    return { file_name, src };
  });
  return Promise.resolve(result);
}
