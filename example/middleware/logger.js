const { log } = require('@shared/util');

function createLoggerMiddleware() {
  return function logger(req, res, next) {
    log('A route was invoked.');
    next();
  };
}

module.exports = {
  fn: createLoggerMiddleware
};

