# Changes

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
