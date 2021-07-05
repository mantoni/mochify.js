'use strict';

const fs = require('fs/promises');
const { promisify } = require('util');
const path = require('path');
const https = require('https');
const mime = require('mime');

exports.startServer = startServer;

async function startServer(port = null) {
  const [key, cert] = await Promise.all([
    fs.readFile(path.join(__dirname, '..', 'fixture', 'key.pem')),
    fs.readFile(path.join(__dirname, '..', 'fixture', 'cert.pem'))
  ]);

  const server = https.createServer({ key, cert }, (req, res) => {
    if (req.url === '/') {
      res.writeHead(200);
      res.end('<!DOCTYPE html>\n<html><body></body></html>');
    } else {
      const file = req.url.substring(1);
      fs.stat(file, (err) => {
        if (err) {
          res.writeHead(404);
          res.end();
          return;
        }
        res.writeHead(200, {
          'Content-Type': mime.getType(file)
        });
        fs.createReadStream(file).pipe(res);
      });
    }
  });

  server.on('error', (err) => {
    process.stderr.write(err.stack || String(err));
    process.stderr.write('\n');
  });

  await promisify(server.listen).call(server, port);

  return {
    port: server.address().port,
    close: () => promisify(server.close).call(server)
  };
}
