# Mochify Driver for WebDriver

## Local Selenium

Installing selenium server on Mac OS:

```bash
brew install selenium-server-standalone
```

Starting the server:

```bash
selenium-server -port 4444
```

Configuration for local Selenium:

```json
{
  "hostname": "localhost",
  "path": "/wd/hub",
  "port": 4444,
  "capabilities": {
    "browserName": "firefox"
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
  "hostname": "localhost",
  "path": "/",
  "port": 4444,
  "capabilities": {
    "browserName": "safari"
  }
}
```

Running tests in iOS simulator:

```json
{
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
```

See `man safaridriver` for available capabilities.

**IMPORTANT!** You _must_ run your tests in the context of an actual website or
webdriver will fail with a security warning. Use `--serve .` to let Mochify
handle this for you.

## SauceLabs

Config for SauceLabs:

```js
module.exports = {
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
};
```

```bash
BROWSER_NAME="safari"; mochify --driver webdriver test.js
```
