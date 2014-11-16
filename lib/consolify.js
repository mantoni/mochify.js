'use strict';

var fs        = require('fs');
var path      = require('path');
var through   = require('through2');
var resolve   = require('resolve');
var consolify = require('consolify');


var consolifyFile = resolve.sync('consolify', {
  basedir: __dirname,
  packageFilter: function (pkg) {
    return { main : pkg.browser };
  }
});
var consolifyPath = path.relative(process.cwd(), consolifyFile);


module.exports = function (b, opts) {
  b.add('./' + consolifyPath.replace(/\\/g, '/'));

  var done;
  var input;
  function launch() {
    var file = fs.createWriteStream(opts.consolify);
    input = through();
    consolify(input, {}, function () {
      if (done) {
        done();
        done = null;
        if (opts.watch) {
          launch();
        }
      }
    }).pipe(file);
  }

  launch();

  function apply() {
    var wrap = b.pipeline.get('wrap');

    wrap.push(through(function (chunk, enc, next) {
      /*jslint unparam: true*/
      input.write(chunk);
      next();
    }, function (next) {
      done = next;
      input.end();
    }));
  }

  apply();
  b.on('reset', apply);
  b.on('bundle', function (bundle) {
    bundle.on('error', function () {
      if (input) {
        input.end();
        input = null;
        if (opts.watch) {
          launch();
        }
      }
    });
  });

};
