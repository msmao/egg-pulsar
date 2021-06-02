'use strict';

const path = require('path');
const crypto = require('crypto');

// https://pulsar.apache.org/docs/zh-CN/next/client-libraries-node
const pulsar = require('pulsar-client');

class Pulsar {

  constructor(config, app) {
    this.app = app;
    this.config = config;
    this.client = null;
    this.consumerMap = new Map();
    this.producerMap = new Map();
    this.subscriberMap = new Map();

    return this;
  }

  async init() {
    const { config, app } = this;
    const { url, options, subscribe } = config;

    const client = new pulsar.Client(Object.assign({}, options, { serviceUrl: url }));
    this.client = client;

    const directory = path.join(app.config.baseDir, 'app/subscriber');
    app.loader.loadToApp(directory, 'subscribers', {
      caseStyle(filepath) {
        return filepath.substring(0, filepath.lastIndexOf('.')).split('/');
      },
    });

    if (subscribe && subscribe.topic && subscribe.listener && app.subscribers) {

      // this.subscriberMap.set(subscribe.listener, app.subscribers[subscribe.listener]);
      // const Subscriber = this.SubscriberMap.get(subscribe.listener);
      const Subscriber = app.subscribers[subscribe.listener];
      if (!Subscriber) {
        return;
      }

      subscribe.listener = async (message, consumer) => {
        const payload = {
          topicName: message.getTopicName(),
          properties: message.getProperties(),
          data: JSON.parse(message.getData().toString()),
          messageId: message.getMessageId().toString(),
          publishTimestamp: message.getPublishTimestamp(),
          eventTimestamp: message.getEventTimestamp(),
          redeliveryCount: message.getRedeliveryCount(),
          partitionKey: message.getPartitionKey(),
        };
        this.app.coreLogger.info(`[egg-pulsar] recv message ${JSON.stringify(payload)}`);
        const ctx = this.app.createAnonymousContext();
        ctx.message = message;
        ctx.consumer = consumer;
        const subscriber = new Subscriber(ctx);
        await subscriber.consume(payload);
        await consumer.acknowledge(message);
      };

      const key = this.getKey(subscribe);
      const consumer = await client.subscribe(subscribe);
      this.consumerMap.set(key, consumer);
      return consumer;
    }

    return this.client;
  }

  async getProducer(options) {
    if (!options.topic) throw ('pulsar producer topic error!');
    const key = this.getKey(options);
    if (this.producerMap.has(key)) return this.producerMap.get(key);
    const producer = await this.client.createProducer(options);
    this.producerMap.set(key, producer);
    return producer;
  }

  createMessage(payload) {
    if (typeof payload === 'string') return { data: Buffer.from(payload) };
    if (typeof payload.data === 'object') payload.data = JSON.stringify(payload.data);
    if (typeof payload.data === 'string') payload.data = Buffer.from(payload.data);
    return payload;
  }

  getKey(options) {
    return crypto.createHash('md5').update(JSON.stringify(options)).digest('hex'); // 配置作为唯一键
  }

  async send(payload, topic, producerOptions = {}) {
    if (typeof topic === 'string') topic = { topic };
    const producer = await this.getProducer(Object.assign(producerOptions, topic));
    const message = this.createMessage(payload);
    await producer.send(message);
    this.app.coreLogger.info(`[egg-pulsar] sent message ${JSON.stringify(message)}`);
    // await producer.flush();
    // await producer.close();
  }

}

function createClient(config, app) {
  const client = new Pulsar(config, app);
  app.beforeStart(async () => {
    await client.init();
    app.coreLogger.info('[egg-pulsar] instance status OK, client ready');
  });
  return client;
}

module.exports = app => {
  app.addSingleton('pulsar', createClient);
};
