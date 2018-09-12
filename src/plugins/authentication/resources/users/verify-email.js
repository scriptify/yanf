import { getConstants } from '../../../../yanf-core';

const { sendJSON } = require('../../../../yanf-core/util/app');

const { verifyEmail: verifyUserEmail } = require('../../models/VerificationToken');
const { errorEventEmitter } = require('../../../../yanf-core/util/error-handling');

const { NOT_ENOUGH_PARAMETERS } = getConstants();

async function verifyEmail(req, res) {
  const { token } = req.body;
  if (!token) {
    errorEventEmitter.emit('error', {
      type: NOT_ENOUGH_PARAMETERS, statusCode: 400, req, res
    });
    return;
  }

  await verifyUserEmail(token);
  sendJSON({
    body: { success: true },
    res
  });
}

export default {
  handlerType: 'ACTION',
  name: 'verify-email',
  handler: verifyEmail
};

