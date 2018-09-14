const yanf = require('../../../../yanf-core');

const getValue = require('../../static-lang');

async function getWordsHandler(req, res) {
  const { key, lang } = req.params;
  const data = await getValue({ key, lang });
  yanf.util.sendJSON({
    body: { success: true, data },
    res
  });
}

module.exports = {
  handlerType: 'GET',
  name: 'get-words',
  urlParams: '/:key/:lang',
  handler: getWordsHandler
};
