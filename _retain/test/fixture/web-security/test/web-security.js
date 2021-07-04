/*global describe, it, XMLHttpRequest*/
'use strict';

describe('test', function () {

  it('makes an ajax call to another domain', function (done) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function () {
      done();
    });
    xhr.addEventListener('error', function () {
      done(new Error('XHR error'));
    });
    xhr.open('GET', 'http://localhost:3001');
    xhr.send();
  });

});
