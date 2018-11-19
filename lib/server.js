'use strict';

var fs = require('fs');
var path = require('path');
var https = require('https');
var mime = require('mime');

module.exports = function (port, callback) {
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
        res.writeHead(200, {
          'Content-Type': mime.getType(file)
        });
        fs.createReadStream(file).pipe(res);
      });
    }
  });

  function onError(errListener) {
    server.on('error', errListener);
  }

  function close() {
    server.close();
  }

  server.on('error', function (err) {
    if (callback.called) {
      return;
    }
    callback(err, null, onError, close);
    callback.called = true;
  });
  server.listen(port, function (err) {
    if (callback.called) {
      return;
    }
    callback(err, server.address().port, onError, close);
    callback.called = true;
  });
};
