import yanf from '../../../../yanf-core';

const { NOT_ENOUGH_PARAMETERS } = yanf.getConstants();

async function forgotPassword(req, res) {
  const { mainEmail } = req.body;
  if (!mainEmail) {
    yanf.util.errorEventEmitter.emit('error', {
      type: NOT_ENOUGH_PARAMETERS, statusCode: 400, req, res
    });
    return;
  }

  await yanf.model('ForgotPasswordToken').generateToken(mainEmail);
  yanf.util.sendJSON({
    body: { success: true },
    res
  });
}

export default {
  handlerType: 'ACTION',
  name: 'forgot-password',
  handler: forgotPassword
};
