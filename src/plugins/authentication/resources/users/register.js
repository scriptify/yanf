import yanf from '../../../../yanf-core';

import { getJWT } from '../../setup-passport';

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

export default {
  handlerType: 'POST',
  handler: register,
  name: 'register'
};

