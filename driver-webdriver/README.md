# Mochify Driver for WebDriver

Installing selenium server on Mac OS:

```bash
brew install selenium-server-standalone
```

Starting the server:

```bash
selenium-server -port 4444
```

WebDriver configuration:

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
