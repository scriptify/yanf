const AWS = require('aws-sdk');
const yanf = require('../../../../yanf-core');

async function translateHandler(req, res) {
  const { TRANSLATION_ERROR } = yanf.getConstants();

  const secretAccessKey = yanf.util.getConfigValue({ pluginName: 'aws', path: 'secretAccessKey', err: 'You need to specify the AWS secret access key!' });
  const accessKeyID = yanf.util.getConfigValue({ pluginName: 'aws', path: 'accessKeyID', err: 'You need to specify the AWS accessKeyID!' });
  const region = yanf.util.getConfigValue({ pluginName: 'aws', path: 'region' }) || 'eu-west-1';

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
      yanf.util.errorEventEmitter.emit('error', {
        type: TRANSLATION_ERROR, statusCode: 503, req, res
      });
    } else
      res.json({ success: true, data: data.TranslatedText });
  });
}

module.exports = {
  handlerType: 'ACTION',
  name: 'translate',
  handler: translateHandler,
  middleware: middlewares => [middlewares.login(), middlewares.requireAuthentication()]
};
