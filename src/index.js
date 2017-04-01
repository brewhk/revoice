import fs from 'fs';
import handlebars from 'handlebars';

import Ajv from 'ajv';

import InvoiceSchema from './schema/invoice.json';
import ItemSchema from './schema/item.json';

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

Revoice.validateInvoiceDataObject = function (data) {
  const ajv = new Ajv({
    allErrors: true,
    schemas: [ InvoiceSchema, ItemSchema ],
  });
  const validate = ajv.compile(InvoiceSchema);
  const valid = validate(data);
  return valid ? true : validate.errors;
}

Revoice.generateInvoice = function (template = Revoice.DEFAULT_TEMPLATE, data = {}, options = {}) {
  return new Promise(function (resolve, reject) {

    // Validates the data object to ensure it has all the required fields
    Revoice.validateInvoiceDataObject(data);

    // Get the template and substitute the values in
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
