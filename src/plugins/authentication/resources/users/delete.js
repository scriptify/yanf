const yanf = require('../../../../yanf-core');

async function deleteUserHandler(req, res) {
  const { _id: userId } = req.user;
  await yanf.model('User').delete(userId);
  yanf.util.sendJSON({
    res,
    body: { success: true }
  });
}

export default {
  handlerType: 'DEL',
  handler: deleteUserHandler,
  name: 'delete-user',
  middleware: middlewares => [middlewares.login(), middlewares.requireAuthentication()]
};

