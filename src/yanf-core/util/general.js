import PasswordValidator from 'password-validator';

export function sendJSON({ res, code = 200, body }) {
  return res.json(code, body);
}

export const regex = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  phone: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/
};

export function isPromise(obj) {
  return obj && obj.then && typeof obj.then === 'function';
}

export function getDefinedPropertiesFromObject({ properties, object }) {
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

export function validatePassword(password) {
  // Needs to be strong enough
  return pwSchema.validate(password);
}
