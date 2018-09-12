const { sendJSON } = require('../../../../yanf-core/util/app');

const { delete: deleteWord } = require('../../models/IntlWord');

async function deleteWordHandler(req, res) {
  const deleted = await deleteWord(req.params.key);

  sendJSON({
    body: { success: !!deleted, word: deleted },
    res
  });
}

export default {
  handlerType: 'DEL',
  name: 'delete-word',
  handler: deleteWordHandler,
  middleware: middlewares => [middlewares.authenticated(), middlewares.userOfType('ADM')]
};
