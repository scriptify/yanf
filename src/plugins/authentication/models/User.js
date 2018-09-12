import mongoose from 'mongoose';
import { getConstants } from '../../../yanf-core';

const UserSchema = require('../schemas/User');
const { hashPassword, verifyPassword } = require('../../../yanf-core/util/cryptography');
const { ApiError } = require('../../../yanf-core/util/error-handling');
const { validatePassword } = require('../../../yanf-core/util/general');

const { createToken: createAccountVerificationToken } = require('./VerificationToken');

const { PASSWORD_TOO_WEAK, NO_SUCH_USER } = getConstants();

const User = mongoose.model('User', UserSchema);

export function get(id, fields) {
  if (id)
    return User.findById(id, fields);

  return [];
}

async function register(data) {
  const { password, birthday, ...restData } = data;

  if (!validatePassword(password)) {
    // Password too weak
    throw new ApiError({ name: PASSWORD_TOO_WEAK });
  }

  const passwordHash = await hashPassword(password);

  const newUserData = {
    ...restData,
    birthday: birthday && new Date(birthday),
    passwordHash
  };

  const newUser = new User(newUserData);
  await newUser.save();

  // Successfully registered, send verification email (not obligatory to verify)
  await createAccountVerificationToken({ userId: newUser._id });
  return newUser;
}

async function edit(userId, editedFields) {
  const updatedUser = await User.findByIdAndUpdate(
    userId, { $set: editedFields }, { new: true, runValidators: true }
  );

  return updatedUser;
}

function findByMainEmail(mainEmail) {
  return User.findOne({ mainEmail });
}

async function authenticate({ email, password }) {
  const user = await findByMainEmail(email);
  if (!user) {
    // TODO: Throw error!
    return false;
  }
  return (await verifyPassword({ hash: user.passwordHash, password })) ? user : null;
}

async function changePassword({ id, password }) {
  const user = await User.findById(id);
  if (!user)
    throw new ApiError({ name: NO_SUCH_USER });

  if (!validatePassword(password)) {
    // Password too weak
    throw new ApiError({ name: PASSWORD_TOO_WEAK });
  }

  const passwordHash = await hashPassword(password);
  // Save new pw hash
  await edit(id, { passwordHash });
}

export async function verifyUser(id) {
  const user = await User.findById(id);
  if (!user)
    throw new ApiError({ name: NO_SUCH_USER });

  await edit(id, { isEmailVerified: true });
}

async function deleteUser(id) {
  await User.findByIdAndRemove(id);
}

module.exports = {
  User,
  register,
  edit,
  authenticate,
  findByMainEmail,
  changePassword,
  verifyUser,
  deleteUser,
  get
};
