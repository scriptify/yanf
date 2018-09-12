const { sendJSON } = require('../../../../yanf-core/util/app');

const { get } = require('../../models/User');

async function queryUsersHandler(req, res) {
  let fields = ['firstName', 'lastName', 'userType', 'gender', 'about', 'motivation', 'profilePicture', 'images', 'placeOfResidence.city', 'placeOfResidence.country'];
  const userType = req.user ? req.user.userType : '';

  if (userType === 'RE')
    fields = fields.concat(['mainEmail', 'phoneNr']);
  else if (userType === 'ADM')
    fields = fields.concat(['mainEmail', 'phoneNr', 'birthday', 'otherEmails', 'placeOfResidence', 'qualifications']);

  const users = await get(req.params.id, fields);

  sendJSON({
    body: { success: true, data: users },
    res
  });
}

export default {
  handlerType: 'GET',
  handler: queryUsersHandler,
  name: 'query-users',
  middleware: middlewares => [middlewares.authenticated({ doNotFail: true })]
};
