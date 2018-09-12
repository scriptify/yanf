import notifications from '../../../yanf-core/notifications/index';
import { getConstants } from '../../../yanf-core';

const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { verifyUser, get: getUser } = require('./User');

const VerificationTokenSchema = require('../schemas/VerificationToken');

const { ApiError } = require('../../../yanf-core/util/error-handling');

const { NO_SUCH_TOKEN } = getConstants();

const VerificationToken = mongoose.model('VerificationToken', VerificationTokenSchema);

async function createToken({ userId }) {
  // Look if there is already a token for this user
  const token = await VerificationToken.findOne({ userId });

  if (token) {
    // If so, delete it
    await VerificationToken.deleteOne({ _id: token._id });
  }

  const tokenValue = v4();

  const newToken = new VerificationToken({
    userId,
    value: tokenValue
  });

  await newToken.save();

  const { mainEmail: email, language: lang } = await getUser(userId, ['mainEmail', 'language']);
  notifications.emit('verification', { data: { tokenValue, email, lang } });

  return true;
}

async function verifyEmail(tokenValue) {
  const token = await VerificationToken.findOne({ value: tokenValue });
  if (!token)
    throw new ApiError({ name: NO_SUCH_TOKEN });


  const { userId } = token;
  await verifyUser(userId);

  // Delete token
  await VerificationToken.deleteOne({ _id: token._id });
}

module.exports = {
  VerificationToken,
  createToken,
  verifyEmail
};
