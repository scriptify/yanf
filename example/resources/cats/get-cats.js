const { sendJSON } = require('../../../src/yanf-core/util/app');

async function getCatsHandler(req, res) {
  let body = { cats: [{ name: 'Garfield', profession: 'Darknet Contract Killer', profilePic: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2d7b1bd980752bb3ea0a259f528eae78&auto=format&fit=crop&w=1050&q=80' }] };
  const { id } = req.params;
  if (id)
    body = { cat: { name: 'Yoyo cat' } };
  sendJSON({
    res,
    body
  });
}

export default {
  handlerType: 'GET',
  handler: getCatsHandler,
  urlParams: '/:id',
  name: 'get-cats',
  middleware: middlewares => [middlewares.logger()]
};

