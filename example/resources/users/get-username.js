const yanf = require('yanf-core');

async function getUsernameHandler(req, res) {
  yanf.util.sendJSON({
    res,
    body: { username: 'Franz Josef' }
  });
}

module.exports = {
  handlerType: 'ACTION',
  handler: getUsernameHandler,
  name: 'get-username',
  middleware: middlewares => [middlewares.logger()]
};

