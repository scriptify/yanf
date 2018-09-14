import mongoose from 'mongoose';

const ForgotPasswordTokenSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  value: {
    type: String,
    unique: true,
    required: true
  },
  validTill: {
    type: Date,
    required: true
  }
});

ForgotPasswordTokenSchema.methods.isStillValid = function isStillValid() {
  const { validTill } = this;
  if (Date.now() <= validTill.getTime())
    return true;
  return false;
};

export default ForgotPasswordTokenSchema;
