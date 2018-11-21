# [![Mochify](header.png)](https://github.com/mantoni/mochify.js/)

> TDD with Browserify, Mocha, Headless Chrome and WebDriver

[![Build Status](https://travis-ci.org/mantoni/mochify.js.svg?branch=master)](https://travis-ci.org/mantoni/mochify.js)
[![SemVer]](http://semver.org)
[![License]](https://github.com/mantoni/mochify.js/blob/master/LICENSE)

Browserifies `./test/*.js`, decorated with a [Mocha test runner][], runs it in
Headless Chrome and passes the output back to your console. Cleans up your
stack traces by mapping back to the original sources and removing lines from
the test framework.

## Features

- Run tests in Headless Chrome
    - Supports watch-mode with pre-loaded Chrome page (with `--watch`)
    - Use the Chrome developer tools for debugging ([docs](#debugging))
    - Run builds in CI ([docs](#continuous-integration))
    - Load tests in the context of a file or URL (with `--url`)
    - Optional built-in HTTPS server (with `--https-server`)
- Run tests in real browsers
    - Supports [SauceLabs][] ([docs](#saucelabs-setup))
    - Supports [Appium][] ([docs](#appium-setup))
    - Supports [BrowserStack][] ([docs](#browserstack-setup))
    - Supports [WebDriver][] ([docs](#selenium-webdriver-setup))
- Code coverage options:
    - Using [nyc][] ([docs](#code-coverage-with-nyc))
    - Using [coverify][] (with `--cover`)
- Works with most Mocha reporters ([docs](#reporters))
- Exposes a Node API ([docs](#api))

## Install

This will install Mochify in your current project and add it to the
`devDependencies`:

```
npm install mochify --save-dev
```

[Puppeteer][] will download a recent version of Chromium. If you want to skip
the download and provide your own executable instead, define the
`PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` environment variable or add this to your
`package.json`:

```json
{
  "config": {
    "puppeteer_skip_chromium_download": true
  }
}
```

For proxy settings and other environment variables, see the [Puppeteer
documentation][puppeteer-envs].

## Usage

Configure `"scripts"` in your `package.json` so that your project ships with
the testing infrastructure:

```json
{
  "scripts": {
    "test": "mochify",
    "watch": "mochify --watch",
    "webdriver": "mochify --wd"
  }
}
```

To run from the command line, either run `npm install mochify -g` to have
`mochify` available globally, or from within your project directory run:

```
node_modules/.bin/mochify
```

## Debugging

Place a `debugger` statement in your source code and run `mochify --debug`.
This will open a Chromium instance with developer tools opened and it will
break at the `debugger` statement.

## Command line options

- `--watch` or `-w` use [watchify][] to watch your files and run the tests on
  change.
- `--reporter` or `-R` changes the Mocha reporter (see further down).
- `--grep` sets the Mocha grep option.
- `--invert` sets the Mocha grep `invert` flag.
- `--recursive` include sub directories.
- `--ui` or `-U` changes the Mocha UI. Defaults to `'bdd'`.
- `--timeout` or `-t` changes the Mocha timeout. Defaults to `2000`.
- `--colors` explicitly enables color output.
- `--no-colors` explicitly disables color output.
- `--outfile` or `-o` writes output to this file. If unspecified, mochify
  prints to stdout.
- `--require` or `-r` requires the given module.
- `--debug` launches a non-headless chromium instance with developer tools.
- `--chrome` uses a specific Chrome executable. If not specified, the built-in
  chromium is used.
- `--ignore-ssl-errors` tells Chrome whether or not to ignore ssl certificate
  issues (default is false)
- `--allow-chrome-as-root` allows Chrome to run as root
- `--https-server` launches an HTTPS server on the specified port. If no port is given a random available port will be used.
- `--viewport-width` tells Chrome to use a certain width for its viewport.
- `--viewport-height` tells Chrome to use a certain height for its viewport.
- `--cover` checks code coverage with [coverify][].
- `--node` creates a bare bundle and runs test cases on node.
- `--wd` use [min-webdriver][] to run the tests in multiple real browsers.
- `--url` runs the tests in the context of the given URL.
- `--wd-file` (only with `--wd`) specify the location of the `.min-wd` config file.
- `--consolify output.html` generate a standalone HTML page with [consolify][].
- `--bundle` specify a separate JS file export when using `--consolify`.
- `--transform` specifies a Browserify transform to add. Can be specified
  multiple times. Options can be passed with [subargs][].
- `--global-transform` specifies a Browserify transform to add globally. Can be
  specified multiple times. Options can be passed with [subargs][].
- `--plugin` specifies a Browserify plugin to add. Can be specified multiple
  times. Options can be passed with [subargs][].
- `--extension` search for files with the extension in "require" statements.
- `--no-browser-field` turns off package.json browser field resolution.
- `--no-commondir` preserve original paths.
- `--external` marks given path or module as external resource and
  prevent from being loaded into the bundle.
- `--yields` or `-y` changes the yield interval to allow pending I/O to happen.
- `--version` or `-v` shows the Mochify version number.
- `--help` or `-h` shows usage and all available options.
- `--async-polling` disables async polling when set to false (for use in Appium).

## Continuous Integration

To run builds in CI services like Travis or CircleCI, you must pass `--allow-chrome-as-root`.

Here is a minimal `.travis.yml`:

```yml
language: node_js
node_js:
  - "8"

sudo: false

script:
  - npm test -- --allow-chrome-as-root
```

## Selenium WebDriver setup

- Download the «Selenium Server Standalone» JAR from here:
  <http://selenium-release.storage.googleapis.com/index.html>
- Except for Firefox, you will also need drivers for each browser.
- The driver for Google Chrome can be found here:
  <http://chromedriver.storage.googleapis.com/index.html>
- Put the drivers in the same directory as the JAR file and run:

```bash
java -jar selenium-server-standalone-2.39.0.jar
```

Create `.min-wd` in your project root:

```json
{
  "hostname": "localhost",
  "port": 4444,
  "browsers": [{
    "name": "internet explorer",
    "version": "11"
  }, {
    "name": "chrome"
  }, {
    "name": "firefox"
  }]
}
```

That's it! Now `mochify --wd` will run your Mocha test cases in the configured
browsers simultaneously. If you installed mochify without `-g`, you will have
to run `node_modules/.bin/mochify --wd`.

Additional Selenium capabilities and browser-specific capabilities can be
specified with the `capabilities` property:

```json
{
  "hostname": "localhost",
  "port": 4444,
  "browsers": [{
    "name": "chrome",
    "capabilities": {
      "chromeOptions": {
        "args": ["--headless", "--disable-gpu"]
      }
    }
  }]
}
```

## SauceLabs setup

Export your [SauceLabs][] credentials:

```bash
export SAUCE_USERNAME="your-user-name"
export SAUCE_ACCESS_KEY="your-access-key"
```

Enable SauceLabs in your `.min-wd` file or in the `"webdriver"` property in
your `package.json`:

```json
{
  "sauceLabs": true
}
```

For more information about Selenium WebDriver and SourceLabs support can be
found on the [min-webdriver][] project page.

## Appium setup

__Note__: This has only be tested on Mac OS X High Sierra with the iOS
Simulator so far. If you have successfully tested with other configurations,
please file an issue so that we can extend the docs.

Setup for iOS Simulator on Mac OS X (requires XCode):

- `npm install -g appium`
- `brew install carthage`
- Configure your `.min-wd` file or the `"webdriver"` property in your
  `package.json` like this:

```json
{
  "hostname": "localhost",
  "port": 4723,
  "browsers": [{
    "name": "Safari",
    "platformName": "iOS",
    "platformVersion": "11.2",
    "deviceName": "iPhone Simulator"
  }]
}
```

- Run `appium --log-level error` which should start a server on port `4723`
- Run `mochify --wd --async-polling false`

It's important to use `--async-polling false` here. The default asynchronous
polling does not work with this setup.

## BrowserStack setup

Export your [BrowserStack][] credentials:

```bash
export BROWSERSTACK_USERNAME="your-user-name"
export BROWSERSTACK_ACCESS_KEY="your-access-key"
```

Example `.min-wd` file:

```js
module.exports = {
  "hostname": "hub-cloud.browserstack.com",
  "port": 80,
  "browsers": [{
    "name": "chrome",
    "capabilities": {
      "browser": "Chrome",
      "browserstack.user": process.env.BROWSERSTACK_USERNAME,
      "browserstack.key": process.env.BROWSERSTACK_ACCESS_KEY
    }
  }]
}
```

## Reporters

Mocha reporters known to work:

- min
- dot
- list
- spec
- tap
- json
- doc
- xunit
- markdown
- landing
- nyan

Note: Consuming the output of a machine readable reporter may not work as
expected with `--wd`.

## API

```js
var mochify = require('mochify');

mochify('./test/*.js', {
  reporter: 'tap'
}).bundle();
```

- `mochify()` uses default settings and runs tests in `./test/*.js`
- `mochify(paths)` specifies the paths, a space delimited list of globs
- `mochify(opts)` configures options as described below
- `mochify(paths, opts)` combines custom paths and options

All long form command line options can be used. E.g. `--node` can be configured
as `{ node : true }`, `--no-browser-field` as `{ 'browser-field': false }`,
`--reporter tab` as `{ reporter : 'tab' }` and so on.

Additional API options:

- `output` a stream that receives the test output (e.g. [through2][])
- `glob` options to pass to [glob][]
- `reporterOptions` options to pass to mocha reporter

The `mochify` function returns a Browserify instance. Please refer to the
[Browserify API][] for details.

## Code coverage with NYC

Install `nyc`, the `babelify` transform, `@babel/core` and
`babel-plugin-istanbul`:

```bash
$ npm install nyc babelify @babel/core babel-plugin-istanbul --save-dev
```

Using a `package.json` script that can be run with `npm run cover`:

```json
{
  "scripts" : {
    "cover" : "nyc --instrument false mochify --transform [ babelify --ignore [ test ] --plugins [ babel-plugin-istanbul ] ]"
  }
}
```

## Compatibility

- v6.x
    - Node 6.0+, Node 8.0+, Node 10.0+
    - Mocha ^5.2
    - Browserify ^16.2
    - Puppeteer ^1.10
- v5.2+
    - Node 6.0+, Node 8.0+
    - Mocha ^4.1
    - Browserify ^15.2
    - Puppeteer ^1.0
- v5.0 - v5.1
    - Node 6.0+, Node 8.0+
    - Mocha ^4.0
    - Browserify ^14.4
    - Puppeteer ^0.13
- v4.x
    - Node 4.0+, 6.0+, Node 8.0+
    - PhantomJS 1.9, 2.0
    - Mocha ^4.0
    - Browserify ^14.4
- v3.x
    - Node 4.0+
    - Mocha ^3.2
    - Browserify ^14.1
- v2.15+
    - Browserify 13.x
- v2.14
    - Mocha ^2.3
- v2.13
    - Browserify 11.x
- v2.10 - v2.12
    - Browserify 10.x
- v2.5 - v2.9
    - Browserify 9.x
- v2.4
    - Browserify 8.x
- v2.3
    - Browserify 7.x
- v2.0 - v2.2
    - Browserify 6.x
    - Mocha 2.x
- v1.x
    - Browserify 5.x
    - Mocha 1.x
- v0.x
    - Browserify 4.x

## License

MIT

[Build Status]: http://img.shields.io/travis/mantoni/mochify.js.svg
[SemVer]: http://img.shields.io/:semver-%E2%9C%93-brightgreen.svg
[License]: http://img.shields.io/npm/l/mochify.svg
[watchify]: https://github.com/substack/watchify
[coverify]: https://github.com/substack/coverify
[istanbul]: https://github.com/gotwarlost/istanbul
[mochify-istanbul]: https://github.com/ferlores/mochify-istanbul
[WebDriver]: http://www.seleniumhq.org/projects/webdriver/
[min-webdriver]: https://github.com/mantoni/min-webdriver
[SauceLabs]: https://saucelabs.com
[Appium]: http://appium.io
[BrowserStack]: https://www.browserstack.com
[Mocha test runner]: https://github.com/mantoni/mocaccino.js
[consolify]: https://github.com/mantoni/consolify
[subargs]: https://github.com/substack/subarg
[through2]: https://github.com/rvagg/through2
[Browserify API]: https://github.com/substack/node-browserify#methods
[glob]: https://github.com/isaacs/node-glob
[Puppeteer]: https://github.com/GoogleChrome/puppeteer
[puppeteer-envs]: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#environment-variables
[nyc]: https://github.com/istanbuljs/nyc
