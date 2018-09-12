/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import util from 'util';
import fs from 'fs';
import path from 'path';

import timeParser from '../util/parse-timerange';

const readdir = util.promisify(fs.readdir);
const lstat = util.promisify(fs.lstat);

let allMiddlewares = [];
let apiPrefix;

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (m, w) => w.toUpperCase());
}

function objToArray(obj) {
  return Object.keys(obj).map(key => ({ ...obj[key], key }));
}

function getFileName(absolutePath) {
  return path.basename(absolutePath).split('.')[0];
}

function getFolderName(pathToUse) {
  const fullPath = path.dirname(pathToUse);
  return fullPath.slice(fullPath.lastIndexOf('/') + 1, fullPath.length);
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
        [currFullPath]: require(currFullPath).default
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

async function getResources(resourcePaths, middlewaresArray = allMiddlewares) {
  const middlewares = arrayToObj(middlewaresArray);
  if (!resourcePaths)
    return [];
  const resources = objToArray(await requireFromDirStructure(resourcePaths))
    .map(resource => ({
      ...resource,
      middleware: typeof resource.middleware === 'function' ? resource.middleware(middlewares) : []
    }));
  // Map resources to route paths and reduce them to one object per path
  const extractedRoutes = resources.reduce((acc, resource) => {
    const routeName = getFolderName(resource.key);
    const existingRoute = acc.find(route => route.name === routeName);
    if (!existingRoute) {
      return [
        ...acc,
        {
          name: routeName,
          actions: [resource]
        }
      ];
    }
    return acc.map((route) => {
      if (route.name === routeName) {
        return {
          ...route,
          actions: route.actions.concat([resource])
        };
      }
      return route;
    });
  }, []);
  return extractedRoutes;
}

function createRoute({
  app, method, handler, name, middleware = [], urlParams = ''
}) {
  const { routeErrorHandler } = require('../util/error-handling');
  const url = `/${apiPrefix}/${name}${urlParams}`;
  console.log(`Bootstrap route: [${method.toUpperCase()}] ${url}`);
  app[method](url, middleware, routeErrorHandler(handler));

  if (urlParams.includes('/')) {
    const newUrlParams = urlParams.slice(0, urlParams.lastIndexOf('/'));
    createRoute({
      app, method, handler, name, middleware, urlParams: newUrlParams
    });
  }
}

export async function setupAppLoops(loopsPath) {
  if (!loopsPath)
    return;
  const loops = objToArray(await requireFromDirStructure(loopsPath));
  loops.forEach(({ fn, repeat }) => {
    setInterval(fn, typeof repeat === 'string' ? timeParser.parse(repeat) * 1000 : repeat);
  });
}

export async function addMiddleware(middlewarePath) {
  allMiddlewares = allMiddlewares.concat(await getMiddlewares(middlewarePath));
}

export async function setupResources(resourcePath, app) {
  const { getConfig } = require('..');

  apiPrefix = getConfig().apiPrefix || 'api';
  const resources = await getResources(resourcePath);

  resources.forEach((resource) => {
    const { name, actions: resourceActions } = resource;

    resourceActions.forEach((resourceAction) => {
      const {
        handler,
        middleware = [],
        urlParams = '',
        handlerType,
        name: actionName
      } = resourceAction;
      const actionType = handlerType.toLowerCase();
      if (typeof app[actionType] === 'function') {
        createRoute({
          app, method: actionType, handler, name: `${name}`, middleware, urlParams
        });
      } else if (actionType === 'action') {
        createRoute({
          app,
          method: 'post',
          name: `${name}/actions/${actionName}`,
          handler,
          middleware
        });
      } else
        console.warn(`Invalid action type ${actionType} for route ${name}`);
    });
  });
}
