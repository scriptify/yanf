import yanf from '../../../yanf-core';

export default class File extends yanf.util.YanfModel {
  create({ url, name }) {
    const newFile = new this.Model({ url, name });
    return newFile.save();
  }
}
