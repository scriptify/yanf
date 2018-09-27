/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const moduleAlias = require('module-alias');
const dotEnv = require('dotenv');

const mongoose = require('mongoose');
const setupMongooseJSONSchema = require('mongoose-schema-jsonschema');
const { printType } = require('graphql');

const createGraphQLType = require('mongoose-schema-to-graphql');

const appUtils = require('./util/app');
const configUtils = require('./util/config');
const cryptoUtils = require('./util/cryptography');
const dbUtils = require('./util/db');
const errorHandlingUtils = require('./util/error-handling');
const generalUtils = require('./util/general');

const notifications = require('./notifications');

const YanfModel = require('./framework/YanfModel');

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception: ', err);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled rejection: ', reason, p);
});

dotEnv.config();

class YanfApp {
  constructor() {
    this.defaultPlugins = [
      'yanf-authentication',
      'yanf-error-constants',
      'yanf-internationalization',
      'yanf-s3-upload'
    ];

    this.config = null;
    this.constants = null;
    this.models = {};
    this.app = null;
    this.util = {
      ...appUtils,
      ...configUtils,
      ...cryptoUtils,
      ...dbUtils,
      ...errorHandlingUtils,
      ...generalUtils,
      YanfModel
    };
    this.notifications = notifications;
    this.middlewares = {};
  }

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

  async setup({ configPath, app = { use: () => {} }, ...config }) {
    const {
      setupAppLoops, getMiddlewares, createModels
    } = require('./framework');
    const createConfig = require('./util/config');

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

    // Setup plugins here
    const pluginsToUse = this.config.includes && Array.isArray(this.config.includes) ?
      this.defaultPlugins.concat(this.config.includes) :
      this.defaultPlugins;

    const allPlugins = pluginsToUse.map((pluginPath) => {
      const plugin = require(pluginPath);
      if (!plugin) {
        console.warn(`Plugin '${pluginPath}' was not found and is hence not used.`);
        return null;
      }
      return plugin;
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
      this.middlewares = { ...await getMiddlewares(middlewarPlugin), ...this.middlewares };

    const waitForPluginSetup = allPlugins.map(async (plugin) => {
      // Also fire according plugin hooks
      if (plugin.hooks && plugin.hooks.onBeforeInitialize && typeof plugin.hooks.onBeforeInitialize === 'function')
        plugin.hooks.onBeforeInitialize(app);
      if (plugin.loops)
        await setupAppLoops(plugin.loops);

      if (plugin.hooks && plugin.hooks.onInitialized && typeof plugin.hooks.onInitialized === 'function')
        plugin.hooks.onInitialized(app);
    });

    await Promise.all(waitForPluginSetup);

    // app loops are also setup here
    if (this.config.paths.middleware) {
      this.middlewares = {
        ...await getMiddlewares(this.config.paths.middleware),
        ...this.middlewares
      };
    }
    if (this.config.paths.loops)
      await setupAppLoops(this.config.paths.loops);

    const { appErrorHandler } = require('./util/error-handling');
    app.use(appErrorHandler);

    this.app = app;
  }

  mongooseToGraphQL({ model, name, description }) {
    const nameToUse = name || model;
    const descriptionToUse = description || `${nameToUse} GraphQL Schema derived from mongoose schema.`;
    const yanfModel = this.model(model);
    if (!yanfModel)
      throw new Error(`Can't find yanf model with name ${model}.`);
    const { schema } = yanfModel;
    return printType(createGraphQLType({
      schema,
      name: nameToUse,
      description: descriptionToUse,
      class: 'GraphQLObjectType',
    }));
  }
}

const appSingleton = new YanfApp();

module.exports = appSingleton;
