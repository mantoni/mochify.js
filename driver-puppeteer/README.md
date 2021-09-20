# driver-puppeteer

Run tests in [Puppeteer][web].

[web]: https://pptr.dev/

## Usage

Install the package from npm:

```
npm i @mochify/driver-puppeteer -D
```

and pass it to the CLI:

```
mochify --driver puppeteer ...
```

## Driver options

The driver allows the following options to be set:

### `stderr`

Defines the stream the test output will be written to.
Defaults to `process.stderr`

### `ignoreHTTPSErrors`

Whether to ignore HTTPS errors during navigation.
Defaults to `false`.

### `executablePath`

The optional path of the Chromium binary to be used.
Defaults to `process.env.PUPPETEER_EXECUTABLE_PATH` to work around https://github.com/puppeteer/puppeteer/issues/6957.
In case neither the env var nor a value is given, Puppeteer uses the bundled Chromium version.

### `args`

An optional array of command line flags to pass to Chromium. `--allow-insecure-localhost` and `--disable-dev-shm-usage` will always be used in addition to the given values.

## `url`

Run tests in the context of the given URL.
Defaults to an empty document served using the `file:` scheme.

## Passing through launch options to Puppeteer

In addition to the driver options documented above, `driver-puppeteer` allows you to pass through all of Puppeteer's other `launchOptions` using the defaults as [described here][launch-options].

[launch-options]: https://pptr.dev/#?product=Puppeteer&version=v10.1.0&show=api-puppeteerlaunchoptions
