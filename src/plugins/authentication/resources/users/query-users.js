import yanf from '../../../../yanf-core';

const { sendJSON } = require('../../../../yanf-core/util/app');

async function queryUsersHandler(req, res) {
  const userType = req.user ? req.user.userType : '';

  const users = await yanf.model('User').get(req.params.id, { userType });

  sendJSON({
    body: { success: true, data: users },
    res
  });
}

export default {
  handlerType: 'GET',
  handler: queryUsersHandler,
  urlParams: '/:id',
  name: 'query-users',
  middleware: middlewares => [middlewares.authenticated({ doNotFail: true })]
};
