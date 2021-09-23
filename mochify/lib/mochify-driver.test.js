'use strict';

const proxyquire = require('proxyquire');
const { assert } = require('@sinonjs/referee-sinon');

describe('mochify/lib/mochify-driver', () => {
  function requireResolveMochifyDriver(stubs = {}) {
    const { resolveMochifyDriver } = proxyquire('./mochify-driver', stubs);
    return resolveMochifyDriver;
  }

  it('passes through valid driver instances', () => {
    const resolveMochifyDriver = requireResolveMochifyDriver();
    const ad_hoc_driver = {
      mochifyDriver(_options) {},
      __im_a_test_driver: true
    };
    const result = resolveMochifyDriver(ad_hoc_driver);
    assert.isTrue(result.__im_a_test_driver);
  });

  it('rejects malformed driver instances', () => {
    const resolveMochifyDriver = requireResolveMochifyDriver();
    const bad_ad_hoc_driver = {
      mochyfiDrive(_options) {}
    };
    assert.exception(
      () => {
        resolveMochifyDriver(bad_ad_hoc_driver);
      },
      {
        name: 'TypeError',
        message: 'given driver object'
      }
    );
  });

  it('rejects undefined with a helpful error message', () => {
    const resolveMochifyDriver = requireResolveMochifyDriver();
    assert.exception(
      () => {
        resolveMochifyDriver();
      },
      {
        name: 'TypeError',
        message: 'given driver object'
      }
    );
  });

  it('allows shortcuts for @mochify scoped drivers', () => {
    const resolveMochifyDriver = requireResolveMochifyDriver({
      '@mochify/driver-test': {
        mochifyDriver(_options) {},
        __im_a_test_driver: true,
        '@runtimeGlobal': true,
        '@noCallThru': true
      }
    });
    const result = resolveMochifyDriver('test');
    assert.isTrue(result.__im_a_test_driver);
  });

  it('falls back to loading non-scoped packages', () => {
    const resolveMochifyDriver = requireResolveMochifyDriver({
      'test-driver': {
        mochifyDriver(_options) {},
        __im_a_test_driver: true,
        '@runtimeGlobal': true,
        '@noCallThru': true
      }
    });
    const result = resolveMochifyDriver('test-driver');
    assert.isTrue(result.__im_a_test_driver);
  });

  it('rejects malformed packages referenced as a string', () => {
    const resolveMochifyDriver = requireResolveMochifyDriver({
      'test-driver': {
        mochyfiDrive(_options) {},
        '@runtimeGlobal': true,
        '@noCallThru': true
      }
    });
    assert.exception(
      () => {
        resolveMochifyDriver('test-driver');
      },
      {
        name: 'TypeError',
        message: 'driver "test-driver"'
      }
    );
  });

  it('rejects non-existent packages referenced as a string', () => {
    const resolveMochifyDriver = requireResolveMochifyDriver();
    assert.exception(
      () => {
        resolveMochifyDriver('test-driver');
      },
      {
        name: 'Error',
        message: 'Cannot find module'
      }
    );
  });
});
