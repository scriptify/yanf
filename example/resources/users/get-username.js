const { sendJSON } = require('../../../src/yanf-core/util/app');

async function getUsernameHandler(req, res) {
  sendJSON({
    res,
    body: { username: 'Franz Josef' }
  });
}

export default {
  handlerType: 'ACTION',
  handler: getUsernameHandler,
  name: 'get-username',
  middleware: middlewares => [middlewares.logger()]
};

