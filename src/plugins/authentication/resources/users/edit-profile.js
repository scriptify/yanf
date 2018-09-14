const yanf = require('@yanf/core');

async function editProfile(req, res) {
  const { _id: userId } = req.user;
  await yanf.model('User').edit(userId, req.params);

  yanf.util.sendJSON({
    body: { success: true, user: await yanf.model('User').get(userId) },
    res
  });
}

module.exports = {
  handlerType: 'PATCH',
  handler: editProfile,
  name: 'edit-profile',
  middleware: middlewares => [middlewares.login(), middlewares.requireAuthentication()]
};
