const yanf = require('../../../yanf-core');

module.exports = class IntlWord extends yanf.util.YanfModel {
  async create({ key, languages }) {
    const existingWord = await this.Model.findOne({ key });
    if (existingWord) {
      await this.Model.findOneAndUpdate(
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

  delete(key) {
    return this.Model.findOneAndRemove({ key });
  }

  async get({ key, lang } = {}) {
    if (key && lang) {
      const word = await this.Model.findOne({ key });
      if (!word)
        return '';
      const { value } = word.languages.find(l => l.lang === lang);
      return value;
    }
    return this.Model.find({});
  }

  find({ text }) {
    return this.Model.find({ languages: { $elemMatch: { value: { $regex: text, $options: 'i' } } } });
  }
};
