const yanf = require('@yanf/core');

module.exports = class File extends yanf.util.YanfModel {
  create({ url, name }) {
    const newFile = new this.Model({ url, name });
    return newFile.save();
  }
};
