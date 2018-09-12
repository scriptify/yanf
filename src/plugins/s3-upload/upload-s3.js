const AWS = require('aws-sdk');

const { getConfigValue } = require('../../yanf-core/util/app');
const { create: createDbFileObject } = require('./models/File');

export function uploadToS3({
  buffer,
  fileName,
  additionalParams,
  originalName
}) {
  const secretAccessKey = getConfigValue({ pluginName: 'aws', path: 'secretAccessKey', err: 'You need to specify the AWS secret access key!' });
  const accessKeyID = getConfigValue({ pluginName: 'aws', path: 'accessKeyID', err: 'You need to specify the AWS accessKeyID!' });
  const bucketName = getConfigValue({ pluginName: 'aws', path: 'accessKeyID', err: 'You need to specify the AWS S3 bucket name!' });

  const s3bucket = new AWS.S3({
    accessKeyId: accessKeyID,
    secretAccessKey,
    Bucket: bucketName
  });

  return new Promise((resolve, reject) => {
    s3bucket.createBucket(() => {
      const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ...additionalParams
      };

      s3bucket.upload(params, async (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        const url = data.Location;
        // Save as file object in db, to keep tracks of files on S3
        const { _id } = await createDbFileObject({ url, name: originalName });

        resolve({ _id, url, name: originalName });
      });
    });
  });
}
