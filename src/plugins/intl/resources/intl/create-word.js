const { sendJSON } = require('../../../../yanf-core/util/app');

const { create } = require('../../models/IntlWord');

async function createWordHandler(req, res) {
  const data = req.params;

  const newWord = await create(data);

  sendJSON({
    body: { success: true, word: newWord },
    res
  });
}

export default {
  handlerType: 'POST',
  name: 'create-word',
  handler: createWordHandler,
  middleware: middlewares => [middlewares.authenticated()]
};
