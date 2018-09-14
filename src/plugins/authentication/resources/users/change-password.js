const yanf = require('../../../../yanf-core');

const { NOT_ENOUGH_PARAMETERS } = yanf.getConstants();

async function changePassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) {
    yanf.util.errorEventEmitter.emit('error', {
      type: NOT_ENOUGH_PARAMETERS, statusCode: 400, req, res
    });
    return;
  }

  await yanf.model('ForgotPasswordToken').changeUserPassword({ token, password });
  yanf.util.sendJSON({
    body: { success: true },
    res
  });
}

module.exports = {
  handlerType: 'ACTION',
  name: 'change-password',
  handler: changePassword
};
