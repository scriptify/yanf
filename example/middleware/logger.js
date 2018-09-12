import { log } from '@shared/util';

function createLoggerMiddleware() {
  return function logger(req, res, next) {
    log('A route was invoked.');
    next();
  };
}

export default {
  fn: createLoggerMiddleware
};

