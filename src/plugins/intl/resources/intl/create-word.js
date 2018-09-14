import yanf from '../../../../yanf-core';

async function createWordHandler(req, res) {
  const data = req.params;

  const newWord = await yanf.model('IntlWord').create(data);

  yanf.util.sendJSON({
    body: { success: true, word: newWord },
    res
  });
}

export default {
  handlerType: 'POST',
  name: 'create-word',
  handler: createWordHandler,
  middleware: middlewares => [middlewares.login(), middlewares.requireAuthentication()]
};
