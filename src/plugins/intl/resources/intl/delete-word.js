import yanf from '../../../../yanf-core';

const { sendJSON } = require('../../../../yanf-core/util/app');

async function deleteWordHandler(req, res) {
  const deleted = await yanf.model('IntlWord').delete(req.params.key);

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
