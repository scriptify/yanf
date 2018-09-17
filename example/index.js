const path = require('path');
const yanf = require('yanf-core');

async function main() {
  await yanf.startApp({ configPath: path.join(__dirname, './config.js') });
  console.log('YANF setup finished.');
}

main();
