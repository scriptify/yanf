import yanf from '../../../../yanf-core';

const { sendJSON } = require('../../../../yanf-core/util/app');

const passport = require('passport');

const { getJWT } = require('../../setup-passport');
const { errorEventEmitter } = require('../../../../yanf-core/util/error-handling');

const { AUTH_ERROR } = yanf.getConstants();

async function login(req, res, next) {
  passport.authenticate('local', (err, user) => {
    if (err) {
      errorEventEmitter.emit('error', {
        type: AUTH_ERROR, statusCode: 401, payload: err, req, res
      });
      return;
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        errorEventEmitter.emit('error', {
          type: AUTH_ERROR, statusCode: 401, payload: loginErr, req, res
        });
        return;
      }
      // Return also user
      const {
        _doc: {
          passwordHash,
          ...retUserObj
        }
      } = user;
      sendJSON({
        body: { success: true, token: getJWT(user.id), user: retUserObj },
        res
      });
    });
  })(req, res, next);
}

export default {
  handlerType: 'ACTION',
  handler: login,
  name: 'login'
};
