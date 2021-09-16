# cli

## Usage

Install the package from npm:

```
npm i @mochify/cli -D
```

which will make `mochify` command available:

```
mochify [options] <spec...>
```

## Options

The Mochify CLI can pick up configuration from files or CLI flags.
File config can be provided through `package.json` or in JavaScript, JSON or YAML files and is resolved using the [default lookup mechanism specified by `cosmiconfig`][cosmiconfig].
For example, you could either put configuration in a top-level `mochify` key in package.json for static values or a `mochify.config.js` for dynamic ones, and have them being picked up automatically.
In case an option is present in both the config file and as a CLI flag, the flag takes precedence.
Refer to the documentation of `@mochify/mochify` for available configuration options.

[cosmiconfig]: https://github.com/davidtheclark/cosmiconfig#explorersearch

### `--config`, `-C`

Override the default lookup and use the file as the source of configuration.

### `--driver`, `-D`

The driver to use for running the tests.
Drivers published to the @mochify scope can be referenced using their suffix only (e.g. `puppeteer`), third-party or local drivers will need to use the full package name or file path.
Drivers need to be installed separately from the Mochify CLI.

### `--driver-option`

Free form options to pass to the driver in use. Pass an arbitrary number of options using `--driver-option.foo 1 --driver-option.bar 2`. Refer to the documentation of the driver in use for available options.

### `--reporter`, `-R`

The Mocha reporter to use.
Right now, only reporters that are included with Mocha itself can be used.

### `--bundle`, `-B`

The command used for bundling the given spec.
The called executable is expected to be installed by the consumer.
In case no bundle command is given and --esm is not used, spec files will be concatenated instead of bundling before running the test suite.
The command will receive the resolved value of `<spec...>`.

### `--esm`

Run a local web server and inject all files in the spec as `<script type="module">` instead of bundling.
The server serves the contents of the current working directory unless `--serve` is given, in which case the contents of the given location will be served instead.

### `--serve`, `-S`

Run the tests in the context of a local web server.
Files in the given directory will be served as static assets.

### `--server-option`

Options to pass to the server in case `--serve` or `--esm` is being used.
Currently only `--server-option.port` for passing the port to use is supported.
