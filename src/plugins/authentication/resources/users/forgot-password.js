import yanf from '../../../../yanf-core';

const { sendJSON } = require('../../../../yanf-core/util/app');

const { errorEventEmitter } = require('../../../../yanf-core/util/error-handling');

const { NOT_ENOUGH_PARAMETERS } = yanf.getConstants();

async function forgotPassword(req, res) {
  const { mainEmail } = req.body;
  if (!mainEmail) {
    errorEventEmitter.emit('error', {
      type: NOT_ENOUGH_PARAMETERS, statusCode: 400, req, res
    });
    return;
  }

  await yanf.model('ForgotPasswordToken').generateToken(mainEmail);
  sendJSON({
    body: { success: true },
    res
  });
}

export default {
  handlerType: 'ACTION',
  name: 'forgot-password',
  handler: forgotPassword
};
