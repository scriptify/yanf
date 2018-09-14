import yanf from '../../../yanf-core';

const userGroupsConfig = yanf.util.getConfigValue({ pluginName: 'authentication', path: 'userGroups' });
const defaultPublicFields = yanf.util.getConfigValue({ pluginName: 'authentication', path: 'defaultPublicFields' });
const extendUserModel = yanf.util.getConfigValue({ pluginName: 'authentication', path: 'extendModel' });

const { PASSWORD_TOO_WEAK, NO_SUCH_USER } = yanf.getConstants();

function getFieldsToIncludeByUserType(userType) {
  const group = userGroupsConfig.groups.find(g => g.name === userType);
  return group.include ? group.include.join(' ') : '';
}

function getFieldsToExcludeByUserType(userType) {
  const group = userGroupsConfig.groups.find(g => g.name === userType);
  return group.exclude ? `-${group.exclude.join(' -')}` : '';
}

function getFieldDescriptor(userType) {
  if (userType === null || userType === undefined)
    return undefined;

  const fieldsToInclude = userType ? getFieldsToIncludeByUserType(userType) : '';
  const fieldsToExclude = userType ? getFieldsToExcludeByUserType(userType) : '';
  let fields;
  if (fieldsToInclude)
    fields = fieldsToInclude;
  if (fieldsToExclude)
    fields = fieldsToExclude;
  return `${fields} ${defaultPublicFields ? defaultPublicFields.join(' ') : ''}`;
}

export default class User extends yanf.util.YanfModel {
  constructor({ schema, name }) {
    if (extendUserModel)
      schema.add(extendUserModel);
    if (userGroupsConfig) {
      schema.add({
        [userGroupsConfig.field]: {
          type: String,
          required: true,
          enum: userGroupsConfig.groups.map(group => group.name)
        }
      });
    }
    super({ schema, name });
  }

  get(id, { userType } = {}) {
    // If userType is null or undefined, it is assumed
    //  that this is an internal call (not from e.g. REST)
    //  In that case, ALL fields are submitted. Pass an empty string to userType if not so.
    const fields = getFieldDescriptor(userType);
    if (id)
      return this.Model.findById(id, fields);

    return [];
  }

  async register(data) {
    const { password, birthday, ...restData } = data;

    if (!yanf.util.validatePassword(password)) {
      // Password too weak
      throw new yanf.util.ApiError({ name: PASSWORD_TOO_WEAK });
    }

    const passwordHash = await yanf.util.hashPassword(password);

    const newUserData = {
      ...restData,
      birthday: birthday && new Date(birthday),
      passwordHash
    };

    const newUser = new this.Model(newUserData);
    await newUser.save();

    // Successfully registered, send verification email (not obligatory to verify)
    await yanf.model('VerificationToken').create({ userId: newUser._id });
    return newUser;
  }

  async edit(userId, editedFields) {
    const { passwordHash, mainEmail, ...fieldsToEdit } = editedFields;
    const updatedUser = await this.Model.findByIdAndUpdate(
      userId, { $set: fieldsToEdit }, { new: true, runValidators: true }
    );

    return updatedUser;
  }

  findByMainEmail(mainEmail, { userType } = {}) {
    return this.Model.findOne({ mainEmail }, getFieldDescriptor(userType));
  }

  async authenticate({ email, password }) {
    const user = await this.findByMainEmail(email);
    if (!user) {
      // TODO: Throw error!
      return false;
    }
    return (await yanf.util.verifyPassword({ hash: user.passwordHash, password })) ? user : null;
  }

  async changePassword({ id, password }) {
    const user = await this.Model.findById(id);
    if (!user)
      throw new yanf.util.ApiError({ name: NO_SUCH_USER });

    if (!yanf.util.validatePassword(password)) {
      // Password too weak
      throw new yanf.util.ApiError({ name: PASSWORD_TOO_WEAK });
    }

    const passwordHash = await yanf.util.hashPassword(password);
    // Save new pw hash
    await this.edit(id, { passwordHash });
  }

  async verifyUser(id) {
    const user = await this.Model.findById(id);
    if (!user)
      throw new yanf.util.ApiError({ name: NO_SUCH_USER });

    await this.edit(id, { isEmailVerified: true });
  }

  deleteUser(id) {
    return this.Model.findByIdAndRemove(id);
  }
}
