/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const util = require('util');
const fs = require('fs');
const path = require('path');

const timeParser = require('../util/parse-timerange');

const readdir = util.promisify(fs.readdir);
const lstat = util.promisify(fs.lstat);

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (m, w) => w.toUpperCase());
}

function objToArray(obj, { spread = true } = {}) {
  return Object.keys(obj)
    .map((key) => {
      const objToSpread = spread ? obj[key] : {};
      return {
        key,
        ...objToSpread,
        value: spread ? null : obj[key]
      };
    });
}

function getFileName(absolutePath) {
  return path.basename(absolutePath).split('.')[0];
}

function arrayToObj(arr) {
  const retObj = {};
  arr.forEach((obj) => {
    const keys = Object.keys(obj);
    keys.forEach((key) => {
      retObj[key] = obj[key];
    });
  });
  return retObj;
}

async function requireFromDirStructure(dir, currObj = {}) {
  let retObj = currObj;
  const dirContent = await readdir(dir);

  for (const dirElem of dirContent) {
    const currFullPath = path.join(dir, dirElem);
    const stat = await lstat(currFullPath);
    if (stat.isFile()) {
      retObj = {
        ...retObj,
        [currFullPath]: require(currFullPath)
      };
    } else
      retObj = await requireFromDirStructure(currFullPath, retObj);
  }

  return retObj;
}

async function getMiddlewares(middlwarePath) {
  const middleware = objToArray(
    await requireFromDirStructure(middlwarePath)
  );
  const retArr = middleware.map(m => ({
    [m.name ? toCamelCase(m.name) : toCamelCase(getFileName(m.key))]: m.fn
  }));
  return arrayToObj(retArr);
}

async function setupAppLoops(loopsPath) {
  if (!loopsPath)
    return;
  const loops = objToArray(await requireFromDirStructure(loopsPath));
  loops.forEach(({ fn, repeat }) => {
    setInterval(fn, typeof repeat === 'string' ? timeParser.parse(repeat) * 1000 : repeat);
  });
}

async function createModels({ schemasPath, modelsPath }) {
  const models = objToArray(await requireFromDirStructure(modelsPath), { spread: false });
  const schemas = objToArray(await requireFromDirStructure(schemasPath), { spread: false });

  return models
    .map(({ key, value: Model }) => {
      const modelName = getFileName(key);
      const schema = schemas.find(s => getFileName(s.key) === modelName);
      if (!schema) {
        console.warn(`
          No schema found for model ${key}.
          This model will be ignored.
          Fix it by creating a schema with the same name in the schema directory.`
        );
        return null;
      }
      return new Model({ schema: schema.value, name: modelName });
    })
    .filter(m => m); // Filter out falsy values
}

module.exports = {
  setupAppLoops,
  getMiddlewares,
  createModels
};
