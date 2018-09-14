const path = require('path');

module.exports = {
  name: 's3-upload',
  resources: path.join(__dirname, './resources'),
  middleware: path.join(__dirname, './middleware'),
  models: path.join(__dirname, './models'),
  schemas: path.join(__dirname, './schemas')
};
