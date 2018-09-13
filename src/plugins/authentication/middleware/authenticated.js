import yanf from '../../../yanf-core';

const passport = require('passport');
const { errorEventEmitter } = require('../../../yanf-core/util/error-handling');

function requireAuthentication({ doNotFail = false } = {}) {
  const { AUTH_ERROR } = yanf.getConstants();
  // if  do not fail is true, no error is thrown when user is not logged in
  return function login(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        errorEventEmitter.emit('error', ({
          type: AUTH_ERROR, statusCode: 401, req, res
        }));
        return;
      }
      if (!user && !doNotFail) {
        errorEventEmitter.emit('error', ({
          type: AUTH_ERROR, statusCode: 401, req, res
        }));
        return;
      }
      if (user)
        req.user = user;
      next();
    })(req, res, next);
  };
}

export default {
  fn: requireAuthentication
};
