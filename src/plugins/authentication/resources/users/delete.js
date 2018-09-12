const { sendJSON } = require('../../../../yanf-core/util/app');

const { deleteUser } = require('../../models/User');

async function deleteUserHandler(req, res) {
  const { _id: userId } = req.user;
  await deleteUser(userId);
  sendJSON({
    res,
    body: { success: true }
  });
}

export default {
  handlerType: 'DEL',
  handler: deleteUserHandler,
  name: 'delete-user',
  middleware: middlewares => [middlewares.authenticated()]
};

