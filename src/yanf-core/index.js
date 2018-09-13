/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import moduleAlias from 'module-alias';

import path from 'path';

import restify from 'restify';
import corsMiddleware from 'restify-cors-middleware';

import mongoose from 'mongoose';
import setupMongooseJSONSchema from 'mongoose-schema-jsonschema';

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception: ', err);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled rejection: ', reason, p);
});

class YanfApp {
  static defaultPlugins = [
    '../plugins/authentication',
    '../plugins/error-constants',
    '../plugins/intl',
    '../plugins/s3-upload'
  ];

  config;
  constants;
  models = {};
  app;

  getConfig() {
    if (!this.config)
      throw new Error('You need to first initialize the application before accessing the config.');
    return this.config;
  }

  getConstants() {
    if (!this.constants)
      throw new Error('You need to first initialize the application before accessing the constants.');
    return this.constants;
  }

  model(name) {
    // Get an app model
    return this.models[name];
  }

  async startApp({ configPath, ...config }) {
    const {
      setupAppLoops, setupResources, addMiddleware, createModels
    } = require('./framework');
    const { default: createConfig } = require('./util/config');

    const { connectToDb } = require('./util/db');

    // Setup mongoose json schema support
    setupMongooseJSONSchema(mongoose);

    // Correctly setup app config
    this.config = config;
    if (configPath)
      this.config = require(configPath);

    this.config = createConfig(this.config);

    // Add folder aliases
    if (this.config.aliases)
      moduleAlias.addAliases(this.config.aliases);

    await connectToDb(this.config.mongo.connectionUri);

    // Setup app models
    if (this.config.paths.models && this.config.paths.schemas) {
      const models = await createModels({
        schemasPath: this.config.paths.schemas,
        modelsPath: this.config.paths.models
      });
      models.forEach((model) => {
        this.models[model.name] = model;
      });
    }

    const app = restify.createServer();

    if (this.config.cors === undefined || this.config.cors === true) {
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
    const pluginsToUse = this.config.includes && Array.isArray(this.config.includes) ?
      YanfApp.defaultPlugins.concat(this.config.includes) :
      YanfApp.defaultPlugins;

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
      this.constants = {
        ...this.constants,
        ...constants
      };
    });

    // Setup all models
    const schemasAndModels = allPlugins
      .map(({ schemas, models }) =>
        schemas && models ? ({ schemas, models }) : null
      )
      .filter(sm => sm);

    const waitForModelsSetup = schemasAndModels
      .map(async ({
        schemas: schemasPath, models: modelsPath
      }) => {
        const models = await createModels({ schemasPath, modelsPath });
        models.forEach((model) => {
          this.models[model.name] = model;
        });
      });

    await Promise.all(waitForModelsSetup);

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
    if (this.config.paths.middleware)
      await addMiddleware(this.config.paths.middleware);
    if (this.config.paths.resources)
      await setupResources(this.config.paths.resources, app);
    if (this.config.paths.loops)
      await setupAppLoops(this.config.paths.loops);

    const { appErrorHandler } = require('./util/error-handling');
    app.use(appErrorHandler);

    if (this.config.serveStatic) {
      app.get('/*', (req, res, next) => {
        if (req.url.indexOf('.') === -1)
          req.url = '/index.html';

        const handler = restify.plugins.serveStatic({
          directory: path.resolve(this.config.serveStatic)
        });

        handler(req, res, next);
      });
    }

    app.listen(this.config.port, () => console.log(`Server listening on ${this.config.port}`));

    this.app = app;
  }
}

const appSingleton = new YanfApp();

export default appSingleton;
