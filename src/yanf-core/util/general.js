const phone = require('phone');
const PasswordValidator = require('password-validator');

/**
 * Looks if an email is valid
 * @param {string} email
 */
function validateEmail(email) {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
}

/**
 * Looks if a phone number is valid in one of the specified countries (ISO Country codes)
 * @param {object} param0
 */
function validatePhoneNumber({ number, countries }) {
  return countries
    .map(country => phone(number, country))
    .filter(result => result.length > 0).length > 0;
}

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
  validateEmail,
  validatePhoneNumber,
  isPromise,
  validatePassword,
  getDefinedPropertiesFromObject,
};
