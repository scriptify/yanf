const yanf = require('../../../../yanf-core');

const { getJWT } = require('../../setup-passport');

async function register(req, res) {
  const data = req.params;
  const newUser = await yanf.model('User').register(data);
  // Return also user
  const {
    _doc: {
      passwordHash,
      ...retUserObj
    }
  } = newUser;
  yanf.util.sendJSON({
    body: { success: true, token: getJWT(newUser._id), user: retUserObj },
    res
  });
}

module.exports = {
  handlerType: 'POST',
  handler: register,
  name: 'register'
};

