import yanf from '../../../../yanf-core';

async function isLoggedIn(req, res) {
  if (req.user) {
    const {
      _doc: {
        passwordHash,
        ...user
      }
    } = req.user;
    yanf.util.sendJSON({
      body: { success: true, user },
      res
    });
  } else {
    yanf.util.sendJSON({
      body: { success: false },
      res
    });
  }
}

export default {
  handlerType: 'ACTION',
  name: 'is-logged-in',
  handler: isLoggedIn,
  middleware: middlewares => [middlewares.login()]
};
