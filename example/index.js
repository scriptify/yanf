const path = require('path');
const yanf = require('yanf-core');

async function main() {
  await yanf.setup({ configPath: path.join(__dirname, './config.js') });
  console.log(yanf.model('User'));
}

main();
