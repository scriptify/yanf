const yanf = require('../../../../yanf-core');
const { sendJSON } = require('../../../../yanf-core/util/app');

async function deleteUserHandler(req, res) {
  const { _id: userId } = req.user;
  await yanf.model('User').delete(userId);
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

