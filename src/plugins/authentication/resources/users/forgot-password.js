import { getConstants } from '../../../../yanf-core';

const { sendJSON } = require('../../../../yanf-core/util/app');

const { generateToken } = require('../../models/ForgotPasswordToken');
const { errorEventEmitter } = require('../../../../yanf-core/util/error-handling');

const { NOT_ENOUGH_PARAMETERS } = getConstants();

async function forgotPassword(req, res) {
  const { mainEmail } = req.body;
  if (!mainEmail) {
    errorEventEmitter.emit('error', {
      type: NOT_ENOUGH_PARAMETERS, statusCode: 400, req, res
    });
    return;
  }

  await generateToken(mainEmail);
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
