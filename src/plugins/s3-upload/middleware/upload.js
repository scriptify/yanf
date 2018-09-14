const path = require('path');
const multer = require('multer');
const { v4 } = require('uuid');
const yanf = require('../../../yanf-core');

const temporaryFilePath = yanf.util.getConfigValue({ pluginName: 's3-upload', path: 'temporaryFilePath', err: 'Specify a path where temporary files should be saved after upload!' });

const uploadMiddleware = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, temporaryFilePath));
    },
    filename: (req, file, cb) => {
      cb(null, `${file.fieldname}-${v4()}-${Date.now()}`);
    }
  })
}); // Default maximum for files is 1MB

module.exports = {
  fn: () => uploadMiddleware
};
