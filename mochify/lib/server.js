'use strict';

const fs = require('fs');
const fs_promises = require('fs/promises');
const { promisify } = require('util');
const path = require('path');
const https = require('https');
const mime = require('mime');

exports.startServer = startServer;

async function startServer(options = {}) {
  const [key, cert] = await Promise.all([
    fs_promises.readFile(path.join(__dirname, '..', 'fixture', 'key.pem')),
    fs_promises.readFile(path.join(__dirname, '..', 'fixture', 'cert.pem'))
  ]);

  const base_path = options.serve || process.cwd();

  const server = https.createServer({ key, cert }, async (req, res) => {
    if (req.url === '/') {
      res.writeHead(200);
      res.end('<!DOCTYPE html>\n<html><body></body></html>');
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
  });

  server.on('error', (err) => {
    process.stderr.write(err.stack || String(err));
    process.stderr.write('\n');
  });

  await promisify(server.listen).call(server, options.port);

  return {
    port: server.address().port,
    close: () => promisify(server.close).call(server)
  };
}
