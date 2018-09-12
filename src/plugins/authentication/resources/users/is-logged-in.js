const { sendJSON } = require('../../../../yanf-core/util/app');

async function isLoggedIn(req, res) {
  if (req.user) {
    const {
      _doc: {
        passwordHash,
        ...user
      }
    } = req.user;
    sendJSON({
      body: { success: true, user },
      res
    });
  } else {
    sendJSON({
      body: { success: false },
      res
    });
  }
}

export default {
  handlerType: 'ACTION',
  name: 'is-logged-in',
  handler: isLoggedIn,
  middleware: middlewares => [middlewares.authenticated()]
};
