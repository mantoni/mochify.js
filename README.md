# Mochify

TDD with Browserify, Mocha, PhantomJS and WebDriver

- Fast roundtrip
- No test HTML page
- No server
- Selenium WebDriver & SauceLabs support
- Code coverage with [coverify][]
- Short stack traces with relative paths
- Works with most Mocha reporters

## Install

```
npm install mochify -g
```

- Download and install Phantom.JS: <http://phantomjs.org/>
- Make sure that the `phantomjs` executable is in your `PATH`

## Usage

From within your project directory:

```
mochify
```

Browserifies `./test/*.js`, decorated with a [Mocha test runner][], runs it in
PhantomJS with [phantomic][] and pass the output back to your console. Cleans
up your stack traces by mapping back to the original sources and throws out all
the lines from the test framework.

Options:

- `--watch` or `-w` use [watchify][] to watch your files and run the tests on
  change
- `--wd` use [min-webdriver][] to run the tests in multiple real browsers
- `--reporter` or `-R` changes the Mocha reporter (see further down)
- `--yields` or `-y` changes the yield interval to allow pending I/O to happen
- `--cover` checks code coverage with [coverify][]
- `--node` runs test cases on node (useful with `--cover`)
- `--debug` launches the WebKit debugger
- `--port` uses a specific port for the PhantomJS server

## Example package.json configuration

```
"devDependencies" : {
  "mocha"         : "*",
  "browserify"    : "*",
  "mochify"       : "*"
},
"scripts"         : {
  "start"         : "mochify --watch"
  "test-phantom"  : "mochify",
  "test-wd"       : "mochify --wd",
  "test"          : "npm run test-phantom && npm run test-wd"
}
```

## Selenium WebDriver setup

![mochify](http://maxantoni.de/img/mochify.png)

- Download the «Selenium Server Standalone» JAR from here:
  <https://code.google.com/p/selenium/downloads/list>
- Except for Firefox, you will also need drivers for each browser.
- The driver for Google Chrome can be found here:
  <http://chromedriver.storage.googleapis.com/index.html>
- Put the drivers in the same directory as the JAR file and run:

```
java -jar selenium-server-standalone-2.39.0.jar
```

Create `.min-wd` in your project root:

```
{
  "hostname"  : "localhost",
  "port"      : 4444,
  "browsers"  : [{
    "name"    : "internet explorer",
    "version" : "9"
  }, {
    "name"    : "chrome"
  }, {
    "name"    : "firefox"
  }]
}
```

Thant's it! Now `mochify --wd` will run your Mocha test cases in the configured
browsers simultaniously. If you installed mochify without `-g`, you will need
to run `node_modules/.bin/mochify --wd`.

## SauceLabs

Export your SauceLabs credentials:

```
export SAUCE_USERNAME="your-user-name"
export SAUCE_ACCESS_KEY="your-access-key"
```

Enable SauceLabs in your `.min-wd` file:

```
{
  "sauceLabs": true
}
```

For more information about Selenium WebDriver and SourceLabs support can be
found on the [min-webdriver][] project page.

## Reporters

Mocha reporters known to work:

- min
- dot (default)
- list
- spec
- tap
- json
- doc
- xunit
- markdown

Note: Consuming the output of a machine readable reporter may not work as
expected with `--wd`.

## License

MIT

[watchify]: https://github.com/substack/watchify
[coverify]: https://github.com/substack/coverify
[min-webdriver]: https://github.com/mantoni/min-webdriver
[Mocha test runner]: https://github.com/mantoni/mocaccino.js
[phantomic]: https://github.com/mantoni/phantomic
