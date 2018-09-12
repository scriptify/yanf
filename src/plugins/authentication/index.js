/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import path from 'path';

export default {
  name: 'authentication',
  resources: path.join(__dirname, './resources'),
  middleware: path.join(__dirname, './middleware'),
  hooks: {
    onBeforeInitialize: (app) => {
      const { setup } = require('./setup-passport');
      setup(app);
    }
  }
};
