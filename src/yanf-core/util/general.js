const PasswordValidator = require('password-validator');

const regex = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  phone: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/
};

function isPromise(obj) {
  return obj && obj.then && typeof obj.then === 'function';
}

function getDefinedPropertiesFromObject({ properties, object }) {
  const retObj = {};

  // Only pass in defined fields
  properties.forEach((field) => {
    if (object[field] !== undefined && object[field] !== null) retObj[field] = object[field];
  });

  return retObj;
}

const pwSchema = new PasswordValidator();
pwSchema
  .is().min(8)
  .is().max(100)
  .has()
  .not()
  .spaces();

function validatePassword(password) {
  // Needs to be strong enough
  return pwSchema.validate(password);
}

module.exports = {
  regex,
  isPromise,
  validatePassword,
  getDefinedPropertiesFromObject,
};
