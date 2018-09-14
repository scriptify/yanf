const mongoose = require('mongoose');

module.exports = class YanfModel {
  constructor({ schema, name }) {
    this.name = name;
    this.schema = schema;
    this.Model = mongoose.model(name, schema);
  }

  jsonSchema() {
    return this.schema.jsonSchema();
  }
};
