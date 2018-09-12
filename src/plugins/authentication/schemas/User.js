import autopopulate from 'mongoose-autopopulate';
import mongoose from 'mongoose';
import phone from 'phone';
import { getConstants } from '../../../yanf-core';

const { validateEmail, validatePhoneNumber } = require('../../../yanf-core/util/general');
const { getConfigValue } = require('../../../yanf-core/util/app');

const languages = getConfigValue({ pluginName: 'intl', path: 'availableLanguages' });

const {
  INVALID_EMAIL, TOO_MANY_CHARACTERS, TOO_FEW_CHARACTERS, REQUIRED, INVALID_PHONENR
} = getConstants();

const commonForNames = {
  type: String,
  minlength: [1, TOO_FEW_CHARACTERS],
  maxlength: [100, TOO_MANY_CHARACTERS],
  required: REQUIRED,
};

const commonForAddress = {
  type: String,
  maxlength: [255, TOO_MANY_CHARACTERS]
};

const validPhoneNrCountries = languages ? languages.map(lang => lang.iso.toUpperCase()) : undefined;

const UserSchema = mongoose.Schema({
  mainEmail: {
    type: String,
    trim: true,
    lowercase: true,
    validate: [validateEmail, INVALID_EMAIL],
    unique: true, // Used for indexing
    required: REQUIRED,
  },
  otherEmails: [{
    type: String,
    trim: true,
    lowercase: true,
    validate: [validateEmail, INVALID_EMAIL],
  }],
  passwordHash: { // Argon2 password hash
    type: String,
    required: REQUIRED,
  },
  firstName: commonForNames,
  lastName: commonForNames,
  phoneNr: {
    type: String,
    validate: [
      nr => validatePhoneNumber({ number: nr, countries: validPhoneNrCountries }),
      INVALID_PHONENR,
    ],
  },
  birthday: {
    date: {
      type: Date
    },
    city: {
      type: String,
      maxlength: 100
    },
    province: {
      type: String,
      maxlength: 100
    }
  },
  receiveNewsletter: {
    type: Boolean,
    default: false,
  },
  isEmailVerified: {
    type: String,
    default: false,
  },
  placeOfResidence: {
    addressLine1: commonForAddress,
    addressLine2: {
      ...commonForAddress,
      required: false
    },
    city: commonForAddress,
    region: commonForAddress,
    postalCode: commonForAddress,
    country: {
      type: String,
      maxlength: [2, TOO_MANY_CHARACTERS],
      minlength: [2, TOO_FEW_CHARACTERS]
    }
  },
  profilePicture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    autopopulate: true
  },
  language: {
    type: String,
    enum: languages.map(lang => lang.iso)
  },
  gender: {
    type: String,
    enum: ['M', 'F'],
    default: 'F'
  }
});

UserSchema.virtual('formattedPhoneNr').get(function getValidPhoneNrFromCountries() {
  // Get first valid phoneNr according to the valid countries
  const nrs = validPhoneNrCountries.map(
    country => phone(this.phoneNr, country)
  ).find(el => el.length > 0);
  if (!nrs) return '';
  return nrs[0];
});

UserSchema.plugin(autopopulate);

module.exports = UserSchema;
