const yanf = require('yanf-core');

function requireAuthentication() {
  const { AUTH_ERROR } = yanf.getConstants();
  // Only works if "login" middleware is used before
  return function login(req, res, next) {
    if (!req.user) {
      yanf.util.errorEventEmitter.emit('error', ({
        type: AUTH_ERROR, statusCode: 401, req, res
      }));
      return;
    }
    next();
  };
}

module.exports = {
  fn: requireAuthentication
};
