'use strict';

const fs = require('fs');
const fs_promises = require('fs').promises;
const { promisify } = require('util');
const path = require('path');
const http = require('http');
const mime = require('mime');

exports.startServer = startServer;

/**
 * @typedef {Object} MochifyServer
 * @property {number} port
 * @property {function (): Promise<void>} close
 */

/**
 * @param {string} base_path
 * @param {Object} [options]
 * @param {number} [options.port]
 * @param {string[]} [options._scripts]
 * @param {string[]} [options._modules]
 * @returns {Promise<MochifyServer>}
 */
async function startServer(base_path, options = {}) {
  const server = http.createServer(
    requestHandler(base_path, {
      scripts: options._scripts,
      modules: options._modules
    })
  );

  server.on('error', (err) => {
    process.stderr.write(err.stack || String(err));
    process.stderr.write('\n');
  });

  // @ts-ignore
  await promisify(server.listen).call(server, options.port);

  return {
    // @ts-ignore
    port: server.address().port,
    close: () => promisify(server.close).call(server)
  };
}

function requestHandler(base_path, { scripts = [], modules = [] }) {
  return async (req, res) => {
    if (req.url === '/') {
      res.writeHead(200);
      res.end(`
<!DOCTYPE html>
<html>
<meta charset="utf-8">
<head>
${scripts.map((script) => `<script>${script}</script>`).join('')}
${modules.map((mod) => `<script type="module" src="${mod}"></script>`).join('')}
</head>
<body></body>
</html>
      `);
      return;
    }
    if (req.url === '/favicon.ico') {
      res.writeHead(200, {
        'Content-Type': mime.getType('favicon.ico')
      });
      res.end();
      return;
    }
    const file = path.join(base_path, req.url.substring(1));
    try {
      await fs_promises.stat(file);
    } catch (err) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, {
      'Content-Type': mime.getType(file)
    });
    fs.createReadStream(file).pipe(res);
  };
}
