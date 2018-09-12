const mongoose = require('mongoose');

const FileSchema = require('../schemas/File');

const File = mongoose.model('File', FileSchema);

function create({ url, name }) {
  const newFile = new File({ url, name });
  return newFile.save();
}

module.exports = {
  create
};
