'use strict';

const mock = require('egg-mock');

describe('test/pulsar.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/pulsar-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, pulsar')
      .expect(200);
  });
});
