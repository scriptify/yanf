import path from 'path';
import yanf from '../src/yanf-core';

async function main() {
  await yanf.startApp({ configPath: path.join(__dirname, './config.js') });
  console.log('YANF setup finished.');
}

main();
