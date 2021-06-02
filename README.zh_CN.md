# egg-pulsar

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-pulsar.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-pulsar
[travis-image]: https://img.shields.io/travis/msmao/egg-pulsar.svg?style=flat-square
[travis-url]: https://travis-ci.org/msmao/egg-pulsar
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-pulsar.svg?style=flat-square
[codecov-url]: https://codecov.io/github/msmao/egg-pulsar?branch=master
[david-image]: https://img.shields.io/david/msmao/egg-pulsar.svg?style=flat-square
[david-url]: https://david-dm.org/msmao/egg-pulsar
[snyk-image]: https://snyk.io/test/npm/egg-pulsar/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-pulsar
[download-image]: https://img.shields.io/npm/dm/egg-pulsar.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-pulsar


Apache pulsar plugin for egg

[English Documentation](README.md)

## 依赖说明

```bash
// 根据 OS 安装 pulsar-client-dev 依赖
// https://pulsar.apache.org/docs/en/client-libraries-cpp/

// 在 macOS 安装 libpulsar
$ brew install libpulsar

$ npm i egg-pulsar --save
```

## 开启插件

```js
// config/plugin.js
exports.pulsar = {
  enable: true,
  package: 'egg-pulsar',
};
```
## 详细配置

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

请到 [apache pulsar client-libraries-node](https://pulsar.apache.org/docs/zh-CN/next/concepts-overview/) 查看详细配置项说明。

## 使用场景

### 生产者发送消息

```js
// {app_root}/app/controller/home.js
'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;

    await this.app.pulsar.send({ now: Date.now() }, 'my-topic');
    // or
    await this.app.pulsar.send({ now: Date.now() }, { topic: 'my-topic' });
    // or
    await this.app.pulsar.send({ data: { now: Date.now() }, properties: [ 'a', 'c' ] }, { topic: 'my-topic' });

    ctx.body = 'hi, egg';
  }
}

module.exports = HomeController;
```

#### 消费者订阅并消费消息

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


## 单元测试

```bash
// 本地 docker 启动 pulsar 服务
$ docker run -it \
-p 6650:6650 \
-p 8080:8080 \
--mount source=pulsardata,target=/pulsar/data \
--mount source=pulsarconf,target=/pulsar/conf \
apachepulsar/pulsar:2.7.2 \
bin/pulsar standalone
```

## 提问交流

请到 [egg-pulsar issues](https://github.com/msmao/egg-pulsar/issues) 移步交流。

## License

[MIT](LICENSE)
