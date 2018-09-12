const { sendJSON } = require('../../../../yanf-core/util/app');

const getValue = require('../../static-lang');

async function getWordsHandler(req, res) {
  const { key, lang } = req.params;
  const data = await getValue({ key, lang });
  sendJSON({
    body: { success: true, data },
    res
  });
}

export default {
  handlerType: 'GET',
  name: 'get-words',
  urlParams: '/:key/:lang',
  handler: getWordsHandler
};
