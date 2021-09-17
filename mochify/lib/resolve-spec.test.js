'use strict';

const fs = require('fs');
const proxyquire = require('proxyquire');
const { assert, sinon } = require('@sinonjs/referee-sinon');

describe('mochify/lib/resolve-spec', () => {
  let resolveSpec;
  let glob;

  beforeEach(() => {
    glob = sinon.fake();
    ({ resolveSpec } = proxyquire('./resolve-spec', { glob }));
  });

  it('resolves glob "test/**/*.js" for undefined', async () => {
    const promise = resolveSpec(undefined);
    const matches = ['test/this.js', 'test/that.js'];

    assert.calledOnceWith(glob, 'test/**/*.js');

    glob.callback(null, matches);

    await assert.resolves(promise, matches);
  });

  it('invokes glob with given string pattern', () => {
    const pattern = 'some/*.js';

    resolveSpec(pattern);

    assert.calledOnceWith(glob, pattern);
  });

  it('invokes glob concurrently with patterns from array', () => {
    const patterns = ['a/*.js', 'b/*.js', 'c/*.js'];

    resolveSpec(patterns);

    assert.calledThrice(glob);
    assert.calledWith(glob, patterns[0]);
    assert.calledWith(glob, patterns[1]);
    assert.calledWith(glob, patterns[2]);
  });

  it('resolves with the result from a single pattern', async () => {
    const pattern = 'test/**/*.js';
    const matches = ['test/this.js', 'test/that.js'];

    const promise = resolveSpec(pattern);
    glob.firstCall.callback(null, matches);

    await assert.resolves(promise, matches);
  });

  it('resolves with the result from a pattern array', async () => {
    const patterns = ['a/*.js', 'b/*.js'];
    const matches_a = ['a/this.js', 'a/that.js'];
    const matches_b = ['b/more.js'];

    const promise = resolveSpec(patterns);
    glob.firstCall.callback(null, matches_a);
    glob.secondCall.callback(null, matches_b);

    await assert.resolves(promise, matches_a.concat(matches_b));
  });

  it('rejects with error from glob', async () => {
    const patterns = ['a/*.js', 'b/*.js'];
    const matches_a = ['a/this.js', 'a/that.js'];
    const error = new Error('Oh noes!');

    const promise = resolveSpec(patterns);
    glob.firstCall.callback(null, matches_a);
    glob.secondCall.callback(error);

    await assert.rejects(promise, error);
  });

  it('passes through streams', async () => {
    const stream = fs.createReadStream(__filename);
    const promise = resolveSpec(stream);
    await assert.resolves(promise, stream);
  });
});
