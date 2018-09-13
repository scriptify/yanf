import yanf from '../../../../yanf-core';

const { sendJSON } = require('../../../../yanf-core/util/app');

async function createWordHandler(req, res) {
  const data = req.params;

  const newWord = await yanf.model('IntlWord').create(data);

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
