const fs = require('fs');
const { v4 } = require('uuid');
const pdf = require('html-pdf');
const { promisify } = require('util');
const { uploadToS3 } = require('../aws');

const readFile = promisify(fs.readFile);

function replaceAll(str, what, withThat) {
  let retStr = str;
  while (retStr.includes(what))
    retStr = retStr.replace(what, withThat);
  return retStr;
}

function injectData(html, data) {
  let retHtml = html;
  Object.keys(data).forEach((key) => {
    retHtml = replaceAll(retHtml, `-#${key}#-`, data[key]);
  });
  return retHtml;
}

export default async function createPdfAndUpload({ data, options: { template } }) {
  const pdfOptions = {
    format: 'A4',
    border: {
      top: '1cm',
      left: '2cm',
      right: '2cm',
      bottom: '1cm'
    }
  };

  const html = await readFile(template, 'utf8');
  const htmlWithData = injectData(html, data);

  return new Promise((resolve, reject) => {
    pdf.create(htmlWithData, pdfOptions).toBuffer(async (err, buffer) => {
      if (err) return reject(err);

      const fileName = `pdf-${v4()}-${Date.now()}.pdf`;

      const fileObj = await uploadToS3({
        buffer,
        fileName,
        originalName: fileName,
        additionalParams: {
          ContentType: 'application/pdf'
        }
      });

      return resolve(fileObj);
    });
  });
}
