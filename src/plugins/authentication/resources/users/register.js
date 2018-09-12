const { sendJSON } = require('../../../../yanf-core/util/app');

const { getJWT } = require('../../setup-passport');
const { register: registerUser } = require('../../models/User');

async function register(req, res) {
  const data = req.params;
  const newUser = await registerUser(data);
  // Return also user
  const {
    _doc: {
      passwordHash,
      ...retUserObj
    }
  } = newUser;
  sendJSON({
    body: { success: true, token: getJWT(newUser._id), user: retUserObj },
    res
  });
}

export default {
  handlerType: 'POST',
  handler: register,
  name: 'register'
};

