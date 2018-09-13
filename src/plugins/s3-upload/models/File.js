import YanfModel from '../../../yanf-core/framework/YanfModel';

export default class File extends YanfModel {
  create({ url, name }) {
    const newFile = new this.Model({ url, name });
    return newFile.save();
  }
}
