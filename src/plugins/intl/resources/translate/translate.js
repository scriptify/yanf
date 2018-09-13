import yanf from '../../../../yanf-core';

const AWS = require('aws-sdk');

const { getConfigValue } = require('../../../../yanf-core/util/app');
const { errorEventEmitter } = require('../../../../yanf-core/util/error-handling');

async function translateHandler(req, res) {
  const { TRANSLATION_ERROR } = yanf.getConstants();

  const secretAccessKey = getConfigValue({ pluginName: 'aws', path: 'secretAccessKey', err: 'You need to specify the AWS secret access key!' });
  const accessKeyID = getConfigValue({ pluginName: 'aws', path: 'accessKeyID', err: 'You need to specify the AWS accessKeyID!' });
  const region = getConfigValue({ pluginName: 'aws', path: 'region' }) || 'eu-west-1';

  const {
    sourceLanguageCode: SourceLanguageCode,
    targetLanguageCode: TargetLanguageCode,
    text: Text
  } = req.params;
  const translate = new AWS.Translate({
    accessKeyId: accessKeyID,
    secretAccessKey,
    region,
    endpoint: 'Translate.eu-west-1.amazonaws.com'
  });
  translate.translateText({
    SourceLanguageCode,
    TargetLanguageCode,
    Text,
  }, (err, data) => {
    if (err) {
      errorEventEmitter.emit('error', {
        type: TRANSLATION_ERROR, statusCode: 503, req, res
      });
    } else
      res.json({ success: true, data: data.TranslatedText });
  });
}

export default {
  handlerType: 'ACTION',
  name: 'translate',
  handler: translateHandler,
  middleware: middlewares => [middlewares.authenticated()]
};
