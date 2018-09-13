import yanf from '..';

const { sendJSON } = require('../util/app');
const { EventEmitter } = require('events');

const { isPromise } = require('./general');

const { VALIDATION_ERROR, UNKNOWN_ERROR, ALREADY_EXISTS } = yanf.getConstants();

function routeErrorHandler(routeHandler) {
  // Made for express
  return async function caughtExpressRoute(req, res, next) {
    try {
      const ret = routeHandler(req, res, next);
      if (isPromise(ret))
        await ret;
    } catch (e) {
      // Errors not directly thrown by the api
      console.log('ERROR', e);
      if (e.name === 'ValidationError') {
        sendJSON({
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
        sendJSON({
          body: { error: ALREADY_EXISTS, payload, success: false },
          code: 400,
          res
        });
      } else if (e.isApiError) {
        sendJSON({
          body: { error: e.name, payload: e.payload, success: false },
          code: 500,
          res
        });
      } else {
        const payload = {
          name: e.name || e.type || e.code || ''
        };
        sendJSON({
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
  sendJSON({
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
  // Errors directly thrown by the api
  sendJSON({
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
  errorEventEmitter,
  appErrorHandler,
  ApiError
};
