# Changes

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
