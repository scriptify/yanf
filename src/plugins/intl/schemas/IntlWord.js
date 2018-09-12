import { getConstants } from '../../../yanf-core';

const mongoose = require('mongoose');

const { getConfigValue } = require('../../../yanf-core/util/app');

const languages = getConfigValue({ pluginName: 'intl', path: 'availableLanguages' });

const { TOO_MANY_CHARACTERS, REQUIRED } = getConstants();

const IntlWord = mongoose.Schema({
  key: {
    type: String,
    required: REQUIRED,
    unique: true
  },
  languages: [{
    lang: {
      type: String,
      enum: languages.map(lang => lang.iso),
      required: REQUIRED
    },
    value: {
      type: String,
      maxlength: [5000, TOO_MANY_CHARACTERS],
    }
  }]
});

IntlWord.index({ key: 1 });

module.exports = IntlWord;
