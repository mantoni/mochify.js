# Changes

## 2.18.0

- Implement `--browser-field` option (Koki Takahashi)

## 2.17.0

- Pass 'paths' option to Browserify. (Juha Hytönen)

## 2.16.0

- Add `--wd-file` command line arg (Moshe Kolodny)

## 2.15.0

- Browserify 13.0

To align with Browserify 13, all dependencies have been updated to versions
that use `through2@2` to use streams 3.

## 2.14.3

- Handle bundle errors in `--watch` mode. Fixed [issue #123][].

[issue #123]: https://github.com/mantoni/mochify.js/issues/123

## 2.14.2

- Allow to combine a path with `--recursive`. Fixes [issue #120][].

[issue #120]: https://github.com/mantoni/mochify.js/issues/120

## 2.14.1

- Fix trace filter to also work with relative paths

## 2.14.0

- Bump Mocha to `^2.3` and Mocaccino to `^1.6` to enable custom reporters

## 2.13.1

- Only write to input if input stream is defined (Scott Corgan)
- Only include minor changes rather than major for mocaccino (Chris Wheatley)
- Move from `jslint` to `eslint`

## 2.13.0

- Browserify 11.0

The current watchify dependency already used Browserify 11, causing Browserify
to be installed twice.

## 2.12.0

- Add postinstall script to use global phantomjs by default (Christopher
  Hiller)

## 2.11.1

- Pass `colors` through to mocaccino (Christopher Hiller)

## 2.11.0

- Add ignore SSL errors option `--ignore-ssl-errors` (Adrian Chang)

## 2.10.1

- Do not override the min-wd timeout anymore

## 2.10.0

- Major dependency upgrades:
    - browserify `^10.2`
    - watchify `^3.2`
    - through2 `^1.1`
    - glob `^5.0`

## 2.9.0

- API: Pass `glob` options to glob (James Newell)
- Added reporters to usage (Paul)

## 2.8.1

- Revert to piping the readonly stream to output instead of `b.pipeline`

## 2.8.0

- Use the new consolify browserify plugin
- Add `--bundle` to export JS as a separate file when using consolify

## 2.7.2

- Pipe internal pipeline to output instead of wrapped browserify output (Fixes
  #80)
- Remove obsolete error handling callback

## 2.7.1

- Work around browserify `9.0.5` issue by setting the dependency to `9.0.4`

## 2.7.0

- Add options `--colors` and `--no-colors` to explicitly set Mocha colors

## 2.6.1

- Fix consolify when used with `--watch`

## 2.6.0

- Add `--recursive` flag to include tests in subdirectories (Dylan
  Fogarty-MacDonald)

## 2.5.0

- Use Browserify 9
- Run tests on node 0.10 and 0.12

## 2.4.0

- Use Browserify 8

## 2.3.0

- Use Browserify 7

## 2.2.0

- Add `--web-security` option to toggle PhantomJS web security (Jacob Waller)

## 2.1.1

- Run coverify transform after command-line transforms (Max Goodman)
- Add mochify-istanbul example (Fernando Lores)

## 2.1.0

- Add `--extension` support to require non-JS files (Ryohei Ikegami)

## 2.0.0

- Breaking API change: Return browserify bundle (Fernando Lores)
  <https://github.com/mantoni/mochify.js/pull/52>
- Upgrade Mocha to `^2.0`
- Upgrade Browserify to `^6.3`
- Upgrade Watchify to `^2.1`

## 1.9.0

- Add `--require` and `-r` support

## 1.8.0

- Add `--url` option to run tests in the context of the given URL
- Adjust window width when running tests with WebDriver

## 1.7.0

- Add API

## 1.6.0

- Add mocha grep `--invert` flag (Daniel Davidson)

## 1.5.1

- Fix `--cover` for Windows (#34)
- Improve phantomjs install instructions

## 1.5.0

- Add support for mocha `--grep` option (Daniel Davidson)

## 1.4.0

- Add `--plugin` support

## 1.3.0

- Add `--transform` support
- Fix unknown argument handling

## 1.2.0

- Register mocha as a dependency (Barney)
- Add "landing" to list of supported reporters

## 1.1.3

- Log "# node:" and "# phantom:" titles before running tests
- Fix test case to not fail due to varying timings

## 1.1.2

- Enable colors in coverify if stderr is a tty

## 1.1.1

- Fix resolving the browser part of consolify

## 1.1.0

- Consolify support

## 1.0.6

- Increase `--watch` performance by preloading phantomjs
- Do not quit `--watch` on syntax errors

## 1.0.5

- Fix coverage in phantomjs
- Bump phantomic, source-mapper, resolve and glob

## 1.0.4

- Fix trace handling on Windows
- Use through2 instead of through

## 1.0.3

- Avoid concurrent executions when using `--watch`

## 1.0.2

- Refactor all launchers to be plugins

## 1.0.1

- Fix relative paths in stack frames
- Filter mocaccino stack trace frames

## 1.0.0

- Require Browserify 5
- Use 1.0.0 releases of mocaccino, min-wd and brout

## 0.11.3

- Improve stack trace detection to not match arbitrary URLs

## 0.11.2

- Fix --help

## 0.11.1

- Allow --debug flag (Jerome Gravel-Niquet)

## 0.11.0

- Use new source-mapper module to fix --node stacks
- Upgraded phantomic to `~0.9.0`

## 0.10.0

- Upgraded mocaccino to `~0.8.0` (JP Richardson)
- Added `-t` and `--timeout` arguments to be passed to mocaccino (JP Richardson)
- Added `-U` and `--ui` arguments to be passed to mocaccino
- Ugraded phantomic to `~0.8.0`
- Added `--phantomjs` argument to use a specific PhantomJS binary

## 0.9.4

- Make coverify work with the dot reporter

## 0.9.3

- Add brout dependency to make sure it's only loaded once
- Fix min-webdriver require for windows (take IV)

## 0.9.2

- Show meaningful error and exit if no files are found

## 0.9.1

- Use `-w` as an alias for `--watch` (Andrey Popp)

## 0.9.0

- Support Browserify 4
- Fix min-webdriver require for windows (take III)

## 0.8.2

- Fix min-webdriver require for windows (take II)

## 0.8.1

- Fix min-webdriver path for windows

## 0.8.0

- Stream partial lines of output that don't look like a stack
- Change default reporter to 'dot' to align with the Mocha default
- Use phantomic with 'brout' option
- Bump dependencies

## 0.7.0

- Add `--yields` / `-y` option to specify a yield interval to allow pending I/O
  to happen.

## 0.6.1

- Fix an issue with the way `min-wd` was loaded

## 0.6.0

- SauceLabs support
- WebKit debugger support (`--debug`)
- Auto-select free port for temporary webserver by default (override with
  `--port`)

## 0.5.3

- Only replace paths in lines that look like stacktraces
- Fixes an issue when using the xunit reporter

## 0.5.2

- Filtered stack traces with relative source paths (Andrey Popp)

## 0.5.1

- Add -h/--help and -v/--version (Andrey Popp)
- Up mocaccino and phantomic

## 0.5.0

- Code coverage support using coverify (`--cover`)
- Allow to run tests on node, like `browserify --bare script.js | node` with
  `--node`. Can be combined with `--cover`.

## 0.4.2

- Up phantomic

## 0.4.1

- Up phantomic - fixes stack traces using the embedded source maps
- Windows support
- Waiting for a previous phantomic process to die before launching a new one

## 0.4.0

- Using Mocaccino 0.3.0 which is now a Browserify plugin
- Upgraded Browserify to 3.30.1
- Resolving min-webdriver with resolve so that is can be a normal dependency

## 0.3.2

- Exit with code 1 if phantom tests fail with "tap" reporter
- Resolve Mocha properly

## 0.3.1

- Enabled source maps
- Fixed `-R` as a short form for `--reporter`
- Changed default reporter to "dot" if not using `--watch`
- More documentation

## 0.3.0

- First release on npm
