import yanf from '../../../../yanf-core';

import getValue from '../../static-lang';

async function getWordsHandler(req, res) {
  const { key, lang } = req.params;
  const data = await getValue({ key, lang });
  yanf.util.sendJSON({
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
