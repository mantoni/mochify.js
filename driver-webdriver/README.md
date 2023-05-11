# Mochify driver for WebDriver

## Local Selenium

Installing selenium server on Mac OS:

```bash
brew install selenium-server
brew install geckodriver
```

Starting the server:

```bash
selenium-server standalone --port 4444
```

Configuration for local Selenium:

```json
{
  "driver": "webdriver",
  "driver_options": {
    "hostname": "localhost",
    "path": "/wd/hub",
    "port": 4444,
    "capabilities": {
      "browserName": "firefox"
    }
  }
}
```

## Local SafariDriver

The `safaridriver` executable is included with Safari 13 and later.

Initializing `safaridriver` (only once):

```bash
safaridriver --enable
```

Staring the server:

```bash
safaridriver --port 4444
```

Configuration for local Safari:

```json
{
  "driver": "webdriver",
  "driver_options": {
    "hostname": "localhost",
    "path": "/",
    "port": 4444,
    "capabilities": {
      "browserName": "safari"
    }
  }
}
```

Running tests in iOS simulator:

```json
{
  "driver": "webdriver",
  "driver_options": {
    "hostname": "localhost",
    "path": "/",
    "port": 4444,
    "capabilities": {
      "browserName": "safari",
      "platformName": "iOS",
      "safari:useSimulator": true,
      "safari:deviceType": "iPhone"
    }
  }
}
```

See `man safaridriver` for available capabilities.

**IMPORTANT!** You _must_ run your tests in the context of an actual website or
webdriver will fail with a security warning. Use `--serve .` to let Mochify
handle this for you.

## SauceLabs

Config for SauceLabs:

```js
module.exports = {
  driver: 'webdriver',
  driver_options: {
    hostname: 'ondemand.saucelabs.com',
    path: '/wd/hub',
    port: 80,
    capabilities: {
      browserName: process.env.BROWSER_NAME,
      'sauce:options': {
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY
      }
    }
  }
};
```

```bash
BROWSER_NAME="safari"; mochify --driver webdriver test.js
```
