import { v4 } from 'uuid';
import crypto from 'crypto';
import yanf from '../../../yanf-core';

const { NO_SUCH_USER, NO_SUCH_TOKEN, INVALID_TOKEN } = yanf.getConstants();

function createHashFromToken(token) {
  return crypto.createHmac('sha256', token).digest('hex');
}

export default class ForgotPasswordToken extends yanf.util.YanfModel {
  async generateToken(userMainEmail) {
    const passwordRecoveryTime = yanf.util.getConfigValue({
      pluginName: 'authentication',
      path: 'passwordRecovery.timeout',
      err: 'You need to specify a password recovery timeout!'
    });

    const user = await yanf.model('User').findByMainEmail(userMainEmail);
    if (!user)
      throw new yanf.util.ApiError({ name: NO_SUCH_USER, payload: userMainEmail });

    const { _id: userId } = user;

    // Look if there is already a token for this email
    const token = await this.Model.findOne({ userId });

    if (token) {
      // If so, delete it
      await this.Model.deleteOne({ _id: token._id });
    }

    // Create new token for this user
    const validTill = new Date(Date.now() + (passwordRecoveryTime * 60 * 60 * 1000));
    const tokenValue = v4();

    // Encrypt toke value with key from config
    const hashedToken = createHashFromToken(tokenValue);

    const newToken = new this.Model({
      userId,
      validTill,
      value: hashedToken
    });

    await newToken.save();

    // Send token and validTill via email
    yanf.notifications.emit('forgot-password', {
      data: {
        validTill, tokenValue, email: userMainEmail, lang: user.language
      }
    });

    return true;
  }

  async changePassword({ token, password }) {
    // If this token exists and it is still valid, the password change gets applied
    // Hash token and see if this hash existis (tokens are hashed when they are saved)
    const hashedToken = createHashFromToken(token);

    const tokenFromDb = await this.Model.findOne({ value: hashedToken });

    if (!tokenFromDb)
      throw new yanf.util.ApiError({ name: NO_SUCH_TOKEN });

    // Look if it is still valid
    const isTokenValid = tokenFromDb.isStillValid();
    // If not, delete it
    if (!isTokenValid) {
      await this.Model.deleteOne({ _id: tokenFromDb._id });
      throw new yanf.util.ApiError({ name: INVALID_TOKEN });
    }

    // If so, change password
    await yanf.model('User').changeUserPassword({ id: tokenFromDb.userId, password });

    // Now delete it
    await this.Model.deleteOne({ _id: tokenFromDb._id });
  }
}
