import { getConstants } from '../../../../yanf-core';

const { sendJSON } = require('../../../../yanf-core/util/app');

const { changePassword: changeUserPassword } = require('../../models/ForgotPasswordToken');

const { errorEventEmitter } = require('../../../../yanf-core/util/error-handling');

const { NOT_ENOUGH_PARAMETERS } = getConstants();

async function changePassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) {
    errorEventEmitter.emit('error', {
      type: NOT_ENOUGH_PARAMETERS, statusCode: 400, req, res
    });
    return;
  }

  await changeUserPassword({ token, password });
  sendJSON({
    body: { success: true },
    res
  });
}

export default {
  handlerType: 'ACTION',
  name: 'change-password',
  handler: changePassword
};
