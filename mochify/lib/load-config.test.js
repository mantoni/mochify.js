'use strict';

const proxyquire = require('proxyquire');
const { assert, refute, sinon } = require('@sinonjs/referee-sinon');

describe('mochify/lib/load-config', () => {
  let lilconfig_api;
  let lilconfig;

  beforeEach(() => {
    lilconfig_api = {
      search: sinon.fake.resolves(null),
      load: sinon.fake.resolves(null)
    };
    lilconfig = sinon.fake.returns(lilconfig_api);
  });

  function requireLoadConfig() {
    const { loadConfig } = proxyquire('./load-config', {
      lilconfig: {
        lilconfig
      }
    });
    return loadConfig;
  }

  function setDefaultConfig(config) {
    sinon.replace(lilconfig_api, 'search', sinon.fake.resolves({ config }));
  }

  function setSpecifiedConfig(config) {
    sinon.replace(lilconfig_api, 'load', sinon.fake.resolves({ config }));
  }

  it('searches for default config only', async () => {
    const loadConfig = requireLoadConfig();

    const promise = loadConfig({});

    await assert.resolves(promise);
    assert.calledOnceWithExactly(lilconfig, 'mochify');
    assert.calledOnceWithExactly(lilconfig_api.search);
    refute.called(lilconfig_api.load);
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
    assert.calledOnceWithExactly(lilconfig_api.search);
    assert.calledOnceWithExactly(lilconfig_api.load, 'some.config.js');
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
