# Mochify driver for JSDOM

Run tests in [JSDOM][web].

[web]: https://github.com/jsdom/jsdom

## Usage

Install the package from npm:

```
npm i @mochify/driver-jsdom -D
```

and pass it to the CLI:

```
mochify --driver jsdom ...
```

## Driver options

The driver allows the following options to be set:

### `stderr`

Defines the stream the test output will be written to.
Defaults to `process.stderr`

### `strictSSL`

`strictSSL` can be set to false to disable the requirement that SSL certificates be valid.
Defaults to `false`.

### `pretendToBeVisual`

When the `pretendToBeVisual` option is set to true, jsdom will pretend that it is rendering and displaying content.
Defaults to `true`.

### `url`

Run tests in the context of the given URL.
Defaults to `http://localhost`.

## Passing through other options to JSDOM

In addition to the driver options documented above, `driver-hsom` allows you to pass through all of JSOM's other constructor options using the defaults as [described here][ctr-options].
Note that it's _not_ possible to use a custom `virtualConsole` or set the `runScripts` option as the driver requires to set these itself in order to function correctly.

[ctr-options]: https://github.com/jsdom/jsdom#customizing-jsdom
