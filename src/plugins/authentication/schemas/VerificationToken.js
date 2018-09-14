const mongoose = require('mongoose');

const VerificationToken = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  value: {
    type: String,
    unique: true,
    required: true
  }
});

module.exports = VerificationToken;
