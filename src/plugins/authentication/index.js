/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import path from 'path';

export default {
  name: 'authentication',
  resources: path.join(__dirname, './resources'),
  middleware: path.join(__dirname, './middleware'),
  models: path.join(__dirname, './models'),
  schemas: path.join(__dirname, './schemas'),
  hooks: {
    onBeforeInitialize: (app) => {
      const { setup } = require('./setup-passport');
      setup(app);
    }
  }
};
