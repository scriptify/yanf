import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import jwt from 'jsonwebtoken';
import passportJWT from 'passport-jwt';
import yanf from '../../yanf-core';

const { NOT_FOUND } = yanf.getConstants();

const jwtOptions = {
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'dfsk90309049jklsdf', // A random key...
  jsonWebTokenOptions: {
    expiresIn: '1 month'
  }
};

function setup(app) {
  const jwtStrategy = new passportJWT.Strategy(jwtOptions, async (payload, next) => {
    // Get user by id:
    const { id } = payload;
    const user = await yanf.model('User').get(id);
    if (user) {
      next(null, user);
      return;
    }
    // TODO: Error handling
    next(null, false);
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, cb) => {
        const user = await yanf.model('User').authenticate({ email, password });
        if (!user)
          cb(NOT_FOUND);
        else
          cb(null, user);
      })
  );

  passport.use(jwtStrategy);

  passport.serializeUser((user, cb) => {
    cb(null, user._id);
  });

  passport.deserializeUser(async (id, cb) => {
    cb(null, (await yanf.model('User').get(id)));
  });

  app.use(passport.initialize());
}

function createGetJWTWithOptions(jwtOptionsP) {
  return function getJWT(id) {
    const jwtPayload = { id };
    const token = jwt.sign(jwtPayload, jwtOptionsP.secretOrKey);
    return token;
  };
}


module.exports = {
  getJWT: createGetJWTWithOptions(jwtOptions),
  setup
};
