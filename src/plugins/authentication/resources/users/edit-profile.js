const { sendJSON } = require('../../../../yanf-core/util/app');
const { getDefinedPropertiesFromObject } = require('../../../../yanf-core/util/general');

const { edit, get } = require('../../models/User');

async function editProfile(req, res) {
  const fieldToTransmit = [
    'otherEmails',
    'firstName',
    'lastName',
    'receiveNewsletter',
    'gender',
    'placeOfResidence',
    'about',
    'images',
    'motivation',
    'qualifications',
    'profilePicture',
    'birthday',
    'phoneNr',
    'language',
    'financial'
  ];

  const objToTransmit = getDefinedPropertiesFromObject({
    properties: fieldToTransmit,
    object: req.params
  });

  const { _id: userId } = req.user;
  await edit(userId, objToTransmit);

  sendJSON({
    body: { success: true, user: await get(userId) },
    res
  });
}

export default {
  handlerType: 'PATCH',
  handler: editProfile,
  name: 'edit-profile',
  middleware: middlewares => [middlewares.authenticated()]
};
