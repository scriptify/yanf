import path from 'path';

export default {
  name: 's3-upload',
  resources: path.join(__dirname, './resources'),
  middleware: path.join(__dirname, './middleware'),
};
