'use strict';

const proxyquire = require('proxyquire');
const { assert, refute, sinon } = require('@sinonjs/referee-sinon');

describe('mochify/lib/load-config', () => {
  let cosmiconfig_api;
  let cosmiconfig;

  beforeEach(() => {
    cosmiconfig_api = {
      search: sinon.fake.resolves(null),
      load: sinon.fake.resolves(null)
    };
    cosmiconfig = sinon.fake.returns(cosmiconfig_api);
  });

  function requireLoadConfig() {
    const { loadConfig } = proxyquire('./load-config', {
      cosmiconfig: {
        cosmiconfig
      }
    });
    return loadConfig;
  }

  function setDefaultConfig(config) {
    sinon.replace(cosmiconfig_api, 'search', sinon.fake.resolves({ config }));
  }

  function setSpecifiedConfig(config) {
    sinon.replace(cosmiconfig_api, 'load', sinon.fake.resolves({ config }));
  }

  it('searches for default config only', async () => {
    const loadConfig = requireLoadConfig();

    const promise = loadConfig({});

    await assert.resolves(promise);
    assert.calledOnceWithExactly(cosmiconfig, 'mochify');
    assert.calledOnceWithExactly(cosmiconfig_api.search);
    refute.called(cosmiconfig_api.load);
  });

  it('returns given options', async () => {
    const loadConfig = requireLoadConfig();
    const options = { reporter: 'dot' };

    const promise = loadConfig(options);

    await assert.resolves(promise, options);
  });

  it('returns default config', async () => {
    setDefaultConfig({ reporter: 'dot' });
    const loadConfig = requireLoadConfig();

    const promise = loadConfig({});

    await assert.resolves(promise, { reporter: 'dot' });
  });

  it('merges default config with given options', async () => {
    setDefaultConfig({ ignore: 'node_modules/**' });
    const loadConfig = requireLoadConfig();

    const promise = loadConfig({ reporter: 'dot' });

    await assert.resolves(promise, {
      reporter: 'dot',
      ignore: 'node_modules/**'
    });
  });

  it('merges nested values', async () => {
    setDefaultConfig({
      driver: 'puppeteer',
      driver_options: { args: ['--flag'] }
    });
    const loadConfig = requireLoadConfig();

    const promise = loadConfig({
      driver_options: { executable: '/usr/bin/runme', args: ['--color'] }
    });

    await assert.resolves(promise, {
      driver: 'puppeteer',
      driver_options: {
        args: ['--flag', '--color'],
        executable: '/usr/bin/runme'
      }
    });
  });

  it('options override default config', async () => {
    setDefaultConfig({ reporter: 'dot' });
    const loadConfig = requireLoadConfig();

    const promise = loadConfig({ reporter: 'nyan' });

    await assert.resolves(promise, { reporter: 'nyan' });
  });

  it('searches for default config and specified config file', async () => {
    setSpecifiedConfig({ reporter: 'dot' });
    const loadConfig = requireLoadConfig();

    const promise = loadConfig({ config: 'some.config.js' });

    await assert.resolves(promise, {
      config: 'some.config.js',
      reporter: 'dot'
    });
    assert.calledOnceWithExactly(cosmiconfig_api.search);
    assert.calledOnceWithExactly(cosmiconfig_api.load, 'some.config.js');
  });

  it('options override specified config', async () => {
    setSpecifiedConfig({ reporter: 'dot' });
    const loadConfig = requireLoadConfig();

    const promise = loadConfig({ config: 'some.config.js', reporter: 'nyan' });

    await assert.resolves(promise, {
      config: 'some.config.js',
      reporter: 'nyan'
    });
  });

  it('merges specified config and default config', async () => {
    setDefaultConfig({ reporter: 'dot' });
    setSpecifiedConfig({ ignore: 'node_modules/**' });
    const loadConfig = requireLoadConfig();

    const promise = loadConfig({ config: 'some.config.js' });

    await assert.resolves(promise, {
      config: 'some.config.js',
      reporter: 'dot',
      ignore: 'node_modules/**'
    });
  });

  it('specified config overrides default config', async () => {
    setDefaultConfig({ reporter: 'dot' });
    setSpecifiedConfig({ reporter: 'nyan' });
    const loadConfig = requireLoadConfig();

    const promise = loadConfig({ config: 'some.config.js' });

    await assert.resolves(promise, {
      config: 'some.config.js',
      reporter: 'nyan'
    });
  });
});
