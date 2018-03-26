'use strict';

var fs = require('fs');
var path = require('path');
var https = require('https');

module.exports = function (b, port, callback) {
  var server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'cert.pem')),
  }, function (req, res) {
    if (req.url === '/') {
      res.writeHead(200);
      res.end('<!DOCTYPE html>\n<html><body></body></html>');
    } else {
      var file = req.url.substring(1);
      fs.stat(file, function (err) {
        if (err) {
          res.writeHead(404);
          res.end();
          return;
        }
        res.writeHead(200);
        fs.createReadStream(file).pipe(res);
      });
    }
  });

  server.on('error', function (err) {
    b.emit('error', err);
  });

  server.listen(port, function (err) {
    callback(err, server.address().port);
  });

  b.pipeline.get('wrap').on('end', function () {
    server.close();
  });
};
