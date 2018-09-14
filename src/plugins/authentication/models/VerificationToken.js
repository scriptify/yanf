const yanf = require('../../../yanf-core');

const { v4 } = require('uuid');

const { ApiError } = require('../../../yanf-core/util/error-handling');

const { NO_SUCH_TOKEN } = yanf.getConstants();

module.exports = class VerificationToken extends yanf.util.YanfModel {
  async create({ userId }) {
    // Look if there is already a token for this user
    const token = await this.Model.findOne({ userId });

    if (token) {
      // If so, delete it
      await this.Model.deleteOne({ _id: token._id });
    }

    const tokenValue = v4();

    const newToken = new this.Model({
      userId,
      value: tokenValue
    });

    await newToken.save();

    const { mainEmail: email, language: lang } = await yanf.model('User').get(userId, ['mainEmail', 'language']);
    yanf.util.notifications.emit('verification', { data: { tokenValue, email, lang } });

    return true;
  }

  async verifyEmail(tokenValue) {
    const token = await this.Model.findOne({ value: tokenValue });
    if (!token)
      throw new ApiError({ name: NO_SUCH_TOKEN });


    const { userId } = token;
    await yanf.model('User').verifyUser(userId);

    // Delete token
    await this.Model.deleteOne({ _id: token._id });
  }
};
