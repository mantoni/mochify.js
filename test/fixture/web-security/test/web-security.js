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
    xhr.open('GET', 'https://www.github.com/mantoni/mochify.js');
    xhr.send();
  });

});
