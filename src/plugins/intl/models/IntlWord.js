const mongoose = require('mongoose');

const IntlWordSchema = require('../schemas/IntlWord');

const IntlWord = mongoose.model('IntlWord', IntlWordSchema);

async function create({ key, languages }) {
  const existingWord = await IntlWord.findOne({ key });
  if (existingWord) {
    await IntlWord.findOneAndUpdate(
      { key },
      {
        $set: { languages }
      }
    );
    return existingWord;
  }
  const newWord = new IntlWord({ key, languages });
  return newWord.save();
}

function deleteWord(key) {
  return IntlWord.findOneAndRemove({ key });
}

async function get({ key, lang } = {}) {
  if (key && lang) {
    const word = await IntlWord.findOne({ key });
    if (!word)
      return '';
    const { value } = word.languages.find(l => l.lang === lang);
    return value;
  }
  return IntlWord.find({});
}

function find({ text }) {
  return IntlWord.find({ languages: { $elemMatch: { value: { $regex: text, $options: 'i' } } } });
}

module.exports = {
  IntlWord,
  create,
  get,
  find,
  delete: deleteWord
};
