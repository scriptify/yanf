import { getConstants } from '../../../yanf-core';

const mongoose = require('mongoose');

const { REQUIRED } = getConstants();

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
