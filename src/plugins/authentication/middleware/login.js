const passport = require('passport');
const yanf = require('@yanf/core');

function createLoginMiddleware({ doNotFail = false } = {}) {
  const { AUTH_ERROR } = yanf.getConstants();
  // if  do not fail is true, no error is thrown when user is not logged in
  return function login(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        yanf.util.errorEventEmitter.emit('error', ({
          type: AUTH_ERROR, statusCode: 401, req, res
        }));
        return;
      }
      if (!user && !doNotFail) {
        yanf.util.errorEventEmitter.emit('error', ({
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

module.exports = {
  fn: createLoginMiddleware
};
