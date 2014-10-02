# Mochify

[![Build Status]](https://travis-ci.org/mantoni/mochify.js)
[![SemVer]](http://semver.org)
[![License]](https://github.com/mantoni/mochify.js/blob/master/LICENSE)

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
- Make sure that the `phantomjs` executable is in your `PATH` or use `--phantomjs <path>`

## Usage

From within your project directory:

```
mochify
```

Browserifies `./test/*.js`, decorated with a [Mocha test runner][], runs it in
PhantomJS with [phantomic][] and pass the output back to your console. Cleans
up your stack traces by mapping back to the original sources and throws out all
the lines from the test framework.

Run `mochify --help` to see all available options.

Options:

- `--watch` or `-w` use [watchify][] to watch your files and run the tests on
  change.
- `--reporter` or `-R` changes the Mocha reporter (see further down).
- `--ui` or `-U` changes the Mocha UI. Defaults to `'bdd'`.
- `--timeout` or `-t` changes the Mocha timeout. Defaults to `2000`.
- `--debug` launches the WebKit debugger.
- `--port` uses a specific port for the PhantomJS server.
- `--phantomjs` uses a specific PhantomJS executable. If not specified,
  `phantomjs` is expected on the `$PATH`.
- `--cover` checks code coverage with [coverify][].
- `--node` runs test cases on node (useful with `--cover`).
- `--wd` use [min-webdriver][] to run the tests in multiple real browsers.
- `--consolify` generate a standalone HTML page with [consolify][].
- `--extensions` search for files with these comma-sperated extensions in
  `require` statements.
- `--yields` or `-y` changes the yield interval to allow pending I/O to happen.
- `--version` or `-v` shows the Mochify version number.
- `--help` or `-h` shows usage and all available options.

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

That's it! Now `mochify --wd` will run your Mocha test cases in the configured
browsers simultaniously. If you installed mochify without `-g`, you will have
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
- landing

Note: Consuming the output of a machine readable reporter may not work as
expected with `--wd`.

## Compatibility

- Node 0.10 or later
- Browserify 5.9 or later (since version 1.0.0)
- Browserify 4.x (before 1.0.0)

## License

MIT

[Build Status]: http://img.shields.io/travis/mantoni/mochify.js.svg
[SemVer]: http://img.shields.io/:semver-%E2%9C%93-brightgreen.svg
[License]: http://img.shields.io/npm/l/mochify.svg
[watchify]: https://github.com/substack/watchify
[coverify]: https://github.com/substack/coverify
[min-webdriver]: https://github.com/mantoni/min-webdriver
[Mocha test runner]: https://github.com/mantoni/mocaccino.js
[phantomic]: https://github.com/mantoni/phantomic
[consolify]: https://github.com/mantoni/consolify
