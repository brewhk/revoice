import fs from 'fs';
import handlebars from 'handlebars';

import * as errorStrings from './errors.js';

const _getTemplateUrl = function (name) {
  return `./templates/${name}.html`;
}

const Revoice = {};

Revoice.DEFAULT_TEMPLATE = 'default';

Revoice.getTemplate = function (template = Revoice.DEFAULT_TEMPLATE) {
  return new Promise(function (resolve, reject) {
    fs.exists(_getTemplateUrl(template), function(fileExists) {
      if(fileExists) {
          fs.readFile(_getTemplateUrl(template), 'utf8', function (err, data) {
          resolve(data);
        })
      } else {
        reject(new Error(errorStrings.TEMPLATE_NOT_FOUND));
      }
    })
  })
}

Revoice.generate = function (template = Revoice.DEFAULT_TEMPLATE, data = {}, options = {}) {
  return new Promise(function (resolve, reject) {
    Revoice.getTemplate(template)
      .then(res => {
        const template = handlebars.compile(res);
        const result = template(data);
        resolve(result);
      })
      .catch(err => reject(err));
  });
}

export default Revoice;
