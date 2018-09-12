/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import moduleAlias from 'module-alias';

import path from 'path';

import restify from 'restify';
import corsMiddleware from 'restify-cors-middleware';

const defaultPlugins = [
  '../plugins/authentication',
  '../plugins/error-constants',
  '../plugins/intl',
  '../plugins/s3-upload'
];

export const appData = {
  constants: null,
  config: null
};

export function getConfig() {
  if (!appData.config)
    throw new Error('You need to first initialize the application before accessing the config.');
  return appData.config;
}

export function getConstants() {
  if (!appData.constants)
    throw new Error('You need to first initialize the application before accessing the constants.');
  return appData.constants;
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception: ', err);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled rejection: ', reason, p);
});

export default async function startApp({ configPath, ...config }) {
  const { setupAppLoops, setupResources, addMiddleware } = require('./framework');
  const { default: createConfig } = require('./util/config');

  const { connectToDb } = require('./util/db');

  // Correctly setup app config
  appData.config = config;
  if (configPath)
    appData.config = require(configPath);

  appData.config = createConfig(appData.config);

  // Add folder aliases
  if (appData.config.aliases)
    moduleAlias.addAliases(appData.config.aliases);

  await connectToDb(appData.config.mongo.connectionUri);

  const app = restify.createServer();

  if (appData.config.cors === undefined || appData.config.cors === true) {
    // Enable CORS
    const cors = corsMiddleware({
      origins: ['*'],
      allowHeaders: ['Access-Control-Allow-Origin', 'Authorization']
    });
    app.pre(cors.preflight);
    app.use(cors.actual);
  }


  // Enable Posted JSON data
  app.use(restify.plugins.bodyParser({ mapParams: true }));

  // Setup plugins here
  const pluginsToUse = appData.config.includes && Array.isArray(appData.config.includes) ?
    defaultPlugins.concat(appData.config.includes) :
    defaultPlugins;

  const allPlugins = pluginsToUse.map((pluginPath) => {
    const plugin = require(pluginPath);
    if (!plugin) {
      console.warn(`Plugin '${pluginPath}' was not found and is hence not used.`);
      return null;
    }
    return plugin.default;
  }).filter(p => p);

  // Set all constants first
  const allConstantsPlugins = allPlugins.map(plugin => plugin.constants).filter(c => c);
  allConstantsPlugins.forEach((constants) => {
    appData.constants = {
      ...appData.constants,
      ...constants
    };
  });

  // Then add all middlewares
  const allMiddlewarePlugins = allPlugins.map(plugin => plugin.middleware).filter(m => m);
  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-await-in-loop */
  for (const middlewarPlugin of allMiddlewarePlugins) // Needs to be setup sequentally
    await addMiddleware(middlewarPlugin);

  const waitForPluginSetup = allPlugins.map(async (plugin) => {
    // Also fire according plugin hooks
    if (plugin.hooks && plugin.hooks.onBeforeInitialize && typeof plugin.hooks.onBeforeInitialize === 'function')
      plugin.hooks.onBeforeInitialize(app);
    if (plugin.loops)
      await setupAppLoops(plugin.loops);
    if (plugin.resources)
      await setupResources(plugin.resources, app);

    if (plugin.hooks && plugin.hooks.onInitialized && typeof plugin.hooks.onInitialized === 'function')
      plugin.hooks.onInitialized(app);
  });

  await Promise.all(waitForPluginSetup);

  // Setup custom resources (most important part ofthe whole application);
  // app loops are also setup here
  if (appData.config.paths.middleware)
    await addMiddleware(appData.config.paths.middleware);
  if (appData.config.paths.resources)
    await setupResources(appData.config.paths.resources, app);
  if (appData.config.paths.loops)
    await setupAppLoops(appData.config.paths.loops);

  const { appErrorHandler } = require('./util/error-handling');
  app.use(appErrorHandler);

  if (appData.config.serveStatic) {
    app.get('/*', (req, res, next) => {
      if (req.url.indexOf('.') === -1)
        req.url = '/index.html';

      const handler = restify.plugins.serveStatic({
        directory: path.resolve(appData.config.serveStatic)
      });

      handler(req, res, next);
    });
  }

  app.listen(appData.config.port, () => console.log(`Server listening on ${appData.config.port}`));

  return app;
}
