const yanf = require('@yanf/core');

const adminUserType = yanf.util.getConfigValue({ pluginName: 'intl', path: 'adminUserType' });

async function deleteWordHandler(req, res) {
  const deleted = await yanf.model('IntlWord').delete(req.params.key);

  yanf.util.sendJSON({
    body: { success: !!deleted, word: deleted },
    res
  });
}

module.exports = {
  handlerType: 'DEL',
  name: 'delete-word',
  handler: deleteWordHandler,
  middleware: middlewares => [
    middlewares.login(),
    middlewares.requireAuthentication(),
    ...(
      adminUserType ? [middlewares.userOfType(adminUserType)] : []
    )
  ]
};
