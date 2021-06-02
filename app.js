'use strict';

const pulsar = require('./lib/pulsar');

module.exports = app => {
  if (app.config.pulsar) pulsar(app);
};
