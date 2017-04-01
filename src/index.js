import fs from 'fs';
import handlebars from 'handlebars';
import he from 'he';

import Ajv from 'ajv';

import InvoiceSchema from './schema/invoice.json';
import ItemSchema from './schema/item.json';

import * as errorStrings from './errors.js';

const _getTemplateUrl = function (name) {
  return `./templates/${name}.html`;
}

const Revoice = {};

Revoice.DEFAULT_TEMPLATE = 'default';
Revoice.DEFAULT_OPTIONS = {
  template: Revoice.DEFAULT_TEMPLATE,
}

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

Revoice.validateInvoiceDataObject = function (data = {}) {
  const ajv = new Ajv({
    allErrors: true,
    schemas: [ InvoiceSchema, ItemSchema ],
  });
  const validate = ajv.compile(InvoiceSchema);
  const valid = validate(data);
  return valid ? true : validate.errors.map(errObj => errObj.message).join('; ');
}

Revoice.generateInvoice = function (data = {}, options = Revoice.DEFAULT_OPTIONS) {
  return new Promise(function (resolve, reject) {

    // Validates the data object to ensure it has all the required fields
    const isValidInvoiceDataObject = Revoice.validateInvoiceDataObject(data);

    if (!isValidInvoiceDataObject) {
      reject(new Error(errorStrings.INVALID_DATA_OBJECT + isValidInvoiceDataObject))
    }

    // Get the template and substitute the values in
    Revoice.getTemplate(options.template)
      .then(res => {
        const template = handlebars.compile(res);
        const result = he.decode(template(data));
        resolve(result);
      })
      .catch(err => reject(err));
  });
}

Revoice.generateHTMLInvoice = function (data = {}, options = Revoice.DEFAULT_OPTIONS) {
  return new Promise(function (resolve, reject) {
    Revoice.generateInvoice(data, options)
      .then(html => {
        fs.writeFile("tmp/test.html", html, (err, res) => err ? reject(err) : resolve(res));
      })
      .catch(err => reject(err));
  });
}

export default Revoice;
