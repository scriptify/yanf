import yanf from '../../../../yanf-core';

const { NOT_ENOUGH_PARAMETERS } = yanf.getConstants();

async function verifyEmail(req, res) {
  const { token } = req.body;
  if (!token) {
    yanf.util.errorEventEmitter.emit('error', {
      type: NOT_ENOUGH_PARAMETERS, statusCode: 400, req, res
    });
    return;
  }

  await yanf.model('VerificationToken').verifyEmail(token);
  yanf.util.sendJSON({
    body: { success: true },
    res
  });
}

export default {
  handlerType: 'ACTION',
  name: 'verify-email',
  handler: verifyEmail
};

