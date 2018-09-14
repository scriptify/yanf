const yanf = require('../../../../yanf-core');

async function queryUsersHandler(req, res) {
  const userType = req.user ? req.user.userType : '';

  const users = await yanf.model('User').get(req.params.id, { userType });

  yanf.util.sendJSON({
    body: { success: true, data: users },
    res
  });
}

module.exports = {
  handlerType: 'GET',
  handler: queryUsersHandler,
  urlParams: '/:id',
  name: 'query-users',
  middleware: middlewares => [middlewares.login()]
};
