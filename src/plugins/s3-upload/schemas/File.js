import mongoose from 'mongoose';
import yanf from '../../../yanf-core';

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

export default File;
