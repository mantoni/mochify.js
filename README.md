# Mochify

TDD browserified code with Mocha, PhantomJS and WebDriver

## Install

```
npm install mochify
```

## Usage

Put this into your package.json:

```
{
  "start"        : "mochify --watch"
  "test-phantom" : "mochify -R spec",
  "test-wd"      : "mochify -R spec --wd",
  "test"         : "npm run test-phantom && npm run test-wd"
}
```

## License

MIT
