const mongoose = require('mongoose');
const yanf = require('../../../yanf-core');

const { REQUIRED } = yanf.getConstants();

const File = mongoose.Schema({
  url: {
    type: String,
    required: REQUIRED,
    unique: true
  },
  name: {
    type: String
  }
});

module.exports = File;
