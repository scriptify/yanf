import { getConstants } from '../../../yanf-core';

const mongoose = require('mongoose');
const { v4 } = require('uuid');
const crypto = require('crypto');

const ForgotPasswordTokenSchema = require('../schemas/ForgotPasswordToken');

const { ApiError } = require('../../../yanf-core/util/error-handling');
const { getConfigValue } = require('../../../yanf-core/util/app');
const { default: notifications } = require('../../../yanf-core/notifications');
const { findByMainEmail, changePassword: changeUserPassword } = require('./User');

const { NO_SUCH_USER, NO_SUCH_TOKEN, INVALID_TOKEN } = getConstants();

const ForgotPasswordToken = mongoose.model('ForgotPasswordToken', ForgotPasswordTokenSchema);

function createHashFromToken(token) {
  return crypto.createHmac('sha256', token).digest('hex');
}

async function generateToken(userMainEmail) {
  const passwordRecoveryTime = getConfigValue({
    pluginName: 'authentication',
    path: 'passwordRecovery.timeout',
    err: 'You need to specify a password recovery timeout!'
  });

  const user = await findByMainEmail(userMainEmail);
  if (!user)
    throw new ApiError({ name: NO_SUCH_USER, payload: userMainEmail });

  const { _id: userId } = user;

  // Look if there is already a token for this email
  const token = await ForgotPasswordToken.findOne({ userId });

  if (token) {
    // If so, delete it
    await ForgotPasswordToken.deleteOne({ _id: token._id });
  }

  // Create new token for this user
  const validTill = new Date(Date.now() + (passwordRecoveryTime * 60 * 60 * 1000));
  const tokenValue = v4();

  // Encrypt toke value with key from config
  const hashedToken = createHashFromToken(tokenValue);

  const newToken = new ForgotPasswordToken({
    userId,
    validTill,
    value: hashedToken
  });

  await newToken.save();

  // Send token and validTill via email
  notifications.emit('forgot-password', {
    data: {
      validTill, tokenValue, email: userMainEmail, lang: user.language
    }
  });

  return true;
}

async function changePassword({ token, password }) {
  // If this token exists and it is still valid, the password change gets applied
  // Hash token and see if this hash existis (tokens are hashed when they are saved)
  const hashedToken = createHashFromToken(token);

  const tokenFromDb = await ForgotPasswordToken.findOne({ value: hashedToken });

  if (!tokenFromDb)
    throw new ApiError({ name: NO_SUCH_TOKEN });

  // Look if it is still valid
  const isTokenValid = tokenFromDb.isStillValid();
  // If not, delete it
  if (!isTokenValid) {
    await ForgotPasswordToken.deleteOne({ _id: tokenFromDb._id });
    throw new ApiError({ name: INVALID_TOKEN });
  }

  // If so, change password
  await changeUserPassword({ id: tokenFromDb.userId, password });

  // Now delete it
  await ForgotPasswordToken.deleteOne({ _id: tokenFromDb._id });
}

module.exports = {
  ForgotPasswordToken,
  generateToken,
  changePassword
};
