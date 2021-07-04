/*global describe, it, document*/
'use strict';

describe('requests', function () {
  it('passes', function (done) {
    var img = document.createElement('img');
    img.src = 'some.jpg';
    document.body.appendChild(img);
    // Return asynchronously or the test finishes before chromium attempts to
    // load the image.
    setTimeout(done, 1);
  });
});
