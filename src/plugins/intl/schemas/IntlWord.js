import mongoose from 'mongoose';
import yanf from '../../../yanf-core';

const languages = yanf.util.getConfigValue({ pluginName: 'intl', path: 'availableLanguages' });

const { TOO_MANY_CHARACTERS, REQUIRED } = yanf.getConstants();

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

export default IntlWord;
