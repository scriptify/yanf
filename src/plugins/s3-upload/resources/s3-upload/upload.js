import { getConstants } from '../../../../yanf-core';

const { v4 } = require('uuid');

const fs = require('fs');
const { promisify } = require('util');
const sharp = require('sharp');

const { sendJSON, getConfigValue } = require('../../../../yanf-core/util/app');
const { errorEventEmitter } = require('../../../../yanf-core/util/error-handling');

const { uploadToS3 } = require('../../upload-s3');

const { UPLOAD_ERROR, FILE_TOO_BIG } = getConstants();

const unlinkAsync = promisify(fs.unlink);
const readFileAsync = promisify(fs.readFile);

const MAX_FILE_SIZE_MB = getConfigValue({ pluginName: 's3-upload', path: 'maxFileSize' }) || 2;
const FILE_TYPES = getConfigValue({ pluginName: 's3-upload', path: 'fileTypes', err: 'You need to specify the "fileTypes" field for s3-upload!' });

function bToMb(b) {
  return b * (10 ** -6);
}

async function upload(req, res) {
  if (!req.files) {
    errorEventEmitter.emit('error', {
      type: UPLOAD_ERROR, statusCode: 400, req, res
    });
    return;
  }

  const fileType = Object.keys(req.files).find(k => Object.keys(FILE_TYPES).includes(k));
  const fileTypeToUse = FILE_TYPES[fileType];
  const file = req.files[fileType];

  if (!fileType || !file) {
    errorEventEmitter.emit('error', {
      type: UPLOAD_ERROR, statusCode: 400, req, res
    });
    return;
  }

  if (bToMb(file.size) >= MAX_FILE_SIZE_MB) {
    errorEventEmitter.emit('error', {
      type: FILE_TOO_BIG, statusCode: 400, req, res
    });
    return;
  }
  const acceptedFileTypes = Array.isArray(fileTypeToUse.type) ?
    fileTypeToUse.type :
    [fileTypeToUse.type];

  if (acceptedFileTypes.includes(file.type)) {
    if (file.type.includes('image')) {
      // Image upload
      // Scale down image
      const scaleFactors = fileTypeToUse.options && fileTypeToUse.options.resize ?
        fileTypeToUse.options.resize :
        [];
      const splitted = file.name.split('.');
      const ext = splitted[1];
      const fileName = `${fileType.toLowerCase()}-${v4()}${ext ? `.${ext}` : ''}`;

      // Convert to buffer + upload to S3 bucket
      const fileBuffer = await sharp(file.path)
        .resize(scaleFactors[0], scaleFactors[1])
        .max()
        .toBuffer();
      const uploadedFile = await uploadToS3({
        buffer: fileBuffer,
        fileName,
        originalName: file.name,
        additionalParams: {
          ContentType: file.type
        }
      });
        // Delete old image
      try {
        await unlinkAsync(file.path);
      } catch (e) {
        // console.log('Couldn\'t delete temp image.');
      }

      sendJSON({
        body: { success: true, ...uploadedFile },
        res
      });
      return;
    }
    // All other file types
    const splitted = file.name.split('.');
    const extension = splitted[splitted.length - 1];
    const fileName = `${v4()}.${extension}`;
    const fileContent = await readFileAsync(file.path);
    const uploadedFile = await uploadToS3({
      buffer: fileContent,
      fileName,
      additionalParams: {
        ContentType: file.type
      },
      originalName: file.name,
    });

    try {
      await unlinkAsync(file.path);
    } catch (e) {
      // console.log('Couldn\'t delete temp image.');
    }
    // Document upload
    sendJSON({
      body: { success: true, ...uploadedFile },
      res
    });
    return;
  }

  // Delete file
  await unlinkAsync(file.path);
  errorEventEmitter.emit('error', {
    type: UPLOAD_ERROR, statusCode: 400, req, res
  });
}

export default {
  handlerType: 'ACTION',
  name: 'upload',
  handler: upload,
  middleware: middlewares => [middlewares.authenticated()]
};
