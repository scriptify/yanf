import passport from 'passport';
import yanf from '../../../../yanf-core';

import { getJWT } from '../../setup-passport';

const { AUTH_ERROR } = yanf.getConstants();

async function login(req, res, next) {
  passport.authenticate('local', (err, user) => {
    if (err) {
      yanf.util.errorEventEmitter.emit('error', {
        type: AUTH_ERROR, statusCode: 401, payload: err, req, res
      });
      return;
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        yanf.util.errorEventEmitter.emit('error', {
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
      yanf.util.sendJSON({
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
