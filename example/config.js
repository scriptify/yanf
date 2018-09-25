const path = require('path');

module.exports = {
  include: [], // Plugins to include (module/path)
  exclude: [], // Default plugins to exclude (module/path)
  aliases: {
    '@shared': path.join(__dirname, './shared')
  },
  mongo: {
    connectionUri: {
      dev: process.env.MONGO_DB_URI,
      prod: process.env.MONGO_DB_URI
    }
  },
  port: {
    dev: 8080,
    prod: 8080
  },
  paths: {
    middleware: path.join(__dirname, './middleware'),
    schemas: path.join(__dirname, './schemas'),
    models: path.join(__dirname, './models'),
    loops: path.join(__dirname, './loops')
  },
  cors: true,
  serveStatic: path.join(__dirname, './build'),
  plugins: { // Configure plugins/plugin related stuff here
    aws: {
      secretAccessKey: '',
      accessKeyID: '',
      region: 'eu-west-1',
      bucketName: ''
    },
    's3-upload': {
      temporaryFilePath: './temp',
      maxFileSize: 2, // MB
      fileTypes: {
        AVATAR: {
          type: ['image/png', 'image/jpeg'],
          options: {
            resize: [300]
          }
        },
        PANORAMA: {
          type: ['image/png', 'image/jpeg'],
          options: {
            resize: [1920, 1080]
          }
        },
        DOCUMENT: {
          type: 'application/pdf'
        }
      }
    },
    intl: {
      adminUserType: 'ADM', // Admins can delete intl words
      availableLanguages: [
        {
          iso: 'de',
          displayName: 'Deutsch',
          file: path.join(__dirname, './lang/de.js')
        },
        {
          iso: 'it',
          displayName: 'Italiano',
          file: path.join(__dirname, './lang/it.js')
        },
        {
          iso: 'en',
          displayName: 'English',
          file: path.join(__dirname, './lang/en.js')
        }
      ]
    },
    authentication: {
      extendModel: {},
      passwordRecovery: {
        timeout: 5, // Specified in hours
        key: '2CRHvMh4mz2gKXwY5K6u8FZUQFybeX' // Changing this will invalidate all password recovery keys
      },
      defaultPublicFields: ['_id', 'firstName', 'lastName', 'profilePicture'],
      userGroups: {
        groups: [
          {
            name: 'RC',
          },
          {
            name: 'RE',
            inherits: 'RC',
            include: ['phoneNr']
          },
          {
            name: 'ADM',
            inherits: 'RE'
          }
        ],
        field: 'userType'
      }
    }
  }
};
