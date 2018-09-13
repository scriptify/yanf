import mongoose from 'mongoose';

export default class YanfModel {
  schema;
  name;
  Model;

  constructor({ schema, name }) {
    this.name = name;
    this.schema = schema;
    this.Model = mongoose.model(name, schema);
  }

  jsonSchema() {
    return this.schema.jsonSchema();
  }
}
