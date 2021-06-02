# egg-pulsar

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-pulsar.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-pulsar
[travis-image]: https://img.shields.io/travis/eggjs/egg-pulsar.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-pulsar
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-pulsar.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-pulsar?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-pulsar.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-pulsar
[snyk-image]: https://snyk.io/test/npm/egg-pulsar/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-pulsar
[download-image]: https://img.shields.io/npm/dm/egg-pulsar.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-pulsar

<!--
Description here.
-->

[中文文档](README.zh-CN.md)

## Install

```bash
// install pulsar-client-dev lib for macOS
// https://pulsar.apache.org/docs/en/client-libraries-cpp/

brew install libpulsar
```

```bash
$ npm i egg-pulsar --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.pulsar = {
  enable: true,
  package: 'egg-pulsar',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.pulsar = {
  client: {
    url: 'pulsar://localhost:6650',
    options: {
      operationTimeoutSeconds: 30,
    },
    subscribe: {
      topic: 'persistent://public/default/my-topic',
      subscription: 'sub1',
      subscriptionType: 'Shared',
      ackTimeoutMs: 10000,
      listener: 'xxx', // 对应 app/subscriber/xxx
    },
  }
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

### Producer Send Message

```js

await this.app.pulsar.send({ now: Date.now() }, 'my-topic');

await this.app.pulsar.send({ now: Date.now() }, { topic: 'my-topic' });

await this.app.pulsar.send({ data: { now: Date.now() }, properties: [ 'a', 'c' ] }, { topic: 'my-topic' });

```

#### Consumer Message Of Subscriber

```js
// {app_root}/app/subscriber/test.js
'use strict';
const debug = require('debug')('subscriber');

class TestSubscriber {

  constructor(ctx) {
    this.ctx = ctx;
    this.app = ctx.app;
  }

  async consume(message) {
    debug('message: %s', JSON.stringify(message));
    console.log(message);
    // throw ('consume message error');
  }

}

module.exports = TestSubscriber;
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
