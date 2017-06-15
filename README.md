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
- [Code coverage](#code-coverage-with-istanbul) with [istanbul][] using
  [mochify-istanbul][] plugin
- Short stack traces with relative paths
- Works with most Mocha reporters

![mochify](http://maxantoni.de/img/mochify-1.8.0.png)

## Install

This will install Mochify in your current project and add it to the
`devDependencies`:

```
npm install mochify --save-dev
```

- If the `phantomjs` executable *is not* present in your `PATH`, it will be
  installed locally.
- If the `phantomjs` executable *is* present in your path, it will not be
  installed.

- Install PhantomJS: `npm install phantomjs -g` or download from
  <http://phantomjs.org/>
- Make sure that the `phantomjs` executable is in your `PATH` or use
  `--phantomjs <path>`

## Usage

Configure `"scripts"` in your package.json so that your project ships with the
testing infrastructure:

```
"devDependencies" : {
  "mochify"       : "*"
},
"scripts"         : {
  "start"         : "mochify --watch",
  "phantom"       : "mochify",
  "wd"            : "mochify --wd",
  "cover"         : "mochify --cover",
  "test"          : "npm run phantom && npm run wd && npm run cover"
}
```

To run from the command line, either run `npm install mochify -g` to have
`mochify` available globally, or from within your project directory run:

```
node_modules/.bin/mochify
```

## Default behavior

Browserifies `./test/*.js`, decorated with a [Mocha test runner][], runs it in
PhantomJS with [phantomic][] and pass the output back to your console. Cleans
up your stack traces by mapping back to the original sources and throws out all
the lines from the test framework.

Run `mochify --help` to see all available options.

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
- `--debug` launches the WebKit debugger.
- `--port` uses a specific port for the PhantomJS server.
- `--phantomjs` uses a specific PhantomJS executable. If not specified,
  `phantomjs` is expected on the `$PATH`.
- `--web-security` enables PhantomJS web security and forbids cross-domain XHR
  (default is true)
- `--ignore-ssl-errors` tells PhantomJS whether or not to ignore ssl
  certificate issues (default is false)
- `--viewport-width` tells PhantomJS to use a certain width for its viewport
- `--viewport-height` tells PhantomJS to use a certain height for its viewport
- `--cover` checks code coverage with [coverify][].
- `--node` runs test cases on node (useful with `--cover`).
- `--wd` use [min-webdriver][] to run the tests in multiple real browsers.
- `--url` (only with `--wd`) runs the tests in the context of the given URL.
- `--wd-file` (only with `--wd`) specify the location of the `.min-wd` config file.
- `--consolify output.html` generate a standalone HTML page with [consolify][].
- `--bundle` specify a separate JS file export when using `--consolify`.
- `--transform` specifies a Browserify transform to add. Can be specified
  multiple times. Options can be passed with [subargs][].
- `--plugin` specifies a Browserify plugin to add. Can be specified multiple
  times. Options can be passed with [subargs][].
- `--extension` search for files with the extension in "require" statements.
- `--no-browser-field` turns off package.json browser field resolution.
- `--external` marks given path or module as external resource and
  prevent from being loaded into the bundle.
- `--yields` or `-y` changes the yield interval to allow pending I/O to happen.
- `--version` or `-v` shows the Mochify version number.
- `--help` or `-h` shows usage and all available options.

## Selenium WebDriver setup

- Download the «Selenium Server Standalone» JAR from here:
  <http://selenium-release.storage.googleapis.com/index.html>
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
    "version" : "11"
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

## SauceLabs setup

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
  reporter : 'tap',
  cover    : true
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

## Code coverage with Istanbul

Install the [mochify-istanbul][] plugin:

```bash
$ npm install mochify-istanbul --save-dev
```

Using a `package.json` script that can be run with `npm run cover`:

```
"scripts" : {
  "cover" : "mochify --plugin [ mochify-istanbul --report cobertura ]"
}
```

Using the API:

```js
var mochify = require('mochify');
var istanbul = require('mochify-istanbul');

mochify().plugin(istanbul, {
  report: ['text', 'html', 'text-summary']
}).bundle();
```

## Compatibility

- Node 4.0+, 6.0+ (use `v2.x` for older versions)
- PhantomJS 1.9, 2.0
- v3.x
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
[min-webdriver]: https://github.com/mantoni/min-webdriver
[Mocha test runner]: https://github.com/mantoni/mocaccino.js
[phantomic]: https://github.com/mantoni/phantomic
[consolify]: https://github.com/mantoni/consolify
[subargs]: https://github.com/substack/subarg
[through2]: https://github.com/rvagg/through2
[Browserify API]: https://github.com/substack/node-browserify#methods
[glob]: https://github.com/isaacs/node-glob
