import { getConfigValue } from '../../../yanf-core/util/app';
import yanf from '../../../yanf-core';

function getUserGroupsOfUserType({ userGroup, userTypes = [], groups }) {
  // If a user is an ADM, she's automatically a RE + RC, so return [RE, RC, ADM]
  const group = groups.find(g => g.name === userGroup.name);
  if (!group)
    return null;
  return userTypes
    .concat([userGroup.name])
    .concat(userGroup.inherits
      ? getUserGroupsOfUserType({
        userGroup: groups.find(g => g.name === userGroup.inherits),
        groups
      })
      : []);
}

function createRequireUserTypeMiddleware(userType) {
  const err = 'Authentication needs to be properly configured to use the "user-of-type" middleware.';
  const userGroups = getConfigValue({ pluginName: 'authentication', path: 'userGroups.groups', err });
  const field = getConfigValue({ pluginName: 'authentication', path: 'userGroups.field', err });

  const { WRONG_USER_TYPE } = yanf.getConstants();

  return function requireUserType(req, res, next) {
    if (!userGroups) {
      next();
      return;
    }
    const group = userGroups.find(g => g.name === req.user[field]);

    if (!group) {
      yanf.util.errorEventEmitter.emit('error', {
        type: WRONG_USER_TYPE, statusCode: 400, req, res
      });
      return;
    }

    const groupsIn = getUserGroupsOfUserType({ userGroup: group, groups: userGroups });
    if (!groupsIn.includes(userType)) {
      yanf.util.errorEventEmitter.emit('error', {
        type: WRONG_USER_TYPE, statusCode: 400, req, res
      });
      return;
    }
    next();
  };
}

export default {
  fn: createRequireUserTypeMiddleware
};
