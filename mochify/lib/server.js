'use strict';

const fs = require('fs');
const fs_promises = require('fs').promises;
const { promisify } = require('util');
const path = require('path');
const http = require('http');
const mime = require('mime');

exports.startServer = startServer;

async function startServer(base_path, options = {}) {
  const server = http.createServer(requestHandler(base_path, options.scripts));

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

function requestHandler(base_path, scripts = []) {
  return async (req, res) => {
    if (req.url === '/') {
      res.writeHead(200);
      res.end(`
<!DOCTYPE html>
<html>
${scripts
  .map((script) => {
    const { content = '', ...attrs } = script;
    const s_attrs = Object.keys(attrs)
      .map((k) => `${k}="${script[k]}"`)
      .join(' ');
    return `<script ${s_attrs}>${content}</script>`;
  })
  .join('')}
<body></body>
</html>
      `);
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
