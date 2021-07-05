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
    "browserName": "safari"
  }
}
```

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
