/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const { EventEmitter } = require('events');

function routeErrorHandler(routeHandler) {
  const yanf = require('..');
  const { VALIDATION_ERROR, UNKNOWN_ERROR, ALREADY_EXISTS } = yanf.getConstants();
  return async function caughtExpressRoute(req, res, next) {
    try {
      const ret = routeHandler(req, res, next);
      if (yanf.util.isPromise(ret))
        await ret;
    } catch (e) {
      // Errors not directly thrown by the api
      console.log('ERROR', e);
      if (e.name === 'ValidationError') {
        yanf.util.sendJSON({
          body: {
            error: VALIDATION_ERROR,
            payload: e.errors,
            success: false
          },
          code: 400,
          res
        });
        return;
      }

      if (e.code === 11000) {
        const payload = {
          name: e.name || e.type || e.code || ''
        };
        yanf.util.sendJSON({
          body: { error: ALREADY_EXISTS, payload, success: false },
          code: 400,
          res
        });
      } else if (e.isApiError) {
        yanf.util.sendJSON({
          body: { error: e.name, payload: e.payload, success: false },
          code: 500,
          res
        });
      } else {
        const payload = {
          name: e.name || e.type || e.code || ''
        };
        yanf.util.sendJSON({
          body: { error: UNKNOWN_ERROR, payload, success: false },
          code: 500,
          res
        });
      }
    }
  };
}

// eslint-disable-next-line no-unused-vars
function appErrorHandler(err, req, res, next) {
  const yanf = require('..');
  const { UNKNOWN_ERROR } = yanf.getConstants();
  yanf.util.sendJSON({
    body: {
      error: UNKNOWN_ERROR,
      payload: err,
      success: false
    },
    code: 500,
    res
  });
}

const errorEventEmitter = new EventEmitter();

errorEventEmitter.on('error', ({
  type, payload = {}, statusCode, res
}) => {
  const yanf = require('..');
  // Errors directly thrown by the api
  yanf.util.sendJSON({
    body: {
      error: type,
      payload,
      success: false
    },
    code: statusCode,
    res
  });
});

class ApiError extends Error {
  constructor({ name, payload = {} }) {
    super(name);
    this.isApiError = true;
    this.name = name;
    this.payload = payload;
  }
}

module.exports = {
  routeErrorHandler,
  appErrorHandler,
  ApiError
};
