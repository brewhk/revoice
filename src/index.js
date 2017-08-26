import fs from 'fs';
import { resolve as resolvePath } from 'path';
import handlebars from 'handlebars';
import he from 'he';

import Ajv from 'ajv';
import phantom from 'phantom';
import currencyFormatter from 'currency-formatter';

import InvoiceSchema from './schema/invoice.json';
import ItemSchema from './schema/item.json';

import * as errorStrings from './errors.js';

const Revoice = {};

Revoice.DEFAULT_TEMPLATE = 'default';
Revoice.DEFAULT_OPTIONS = {
  template: Revoice.DEFAULT_TEMPLATE,
  destination: './tmp',
  format: 'A3',
  orientation: 'portrait',
  margin: '1cm',
}

/**
 * Get the URL of the template HTML
 */
Revoice.getTemplateUrl = function getTemplateUrl(template) {
  if (!template) return `./templates/${Revoice.DEFAULT_TEMPLATE}.html`;
  // If the template is a alphanumeric string,
  // we assume it's using a pre-defined template
  // and we return the path to it
  // Otherwise, we treat it as a user-provided path,
  // and simply return that
  return /^[a-zA-Z0-9]+$/.test(template) ? `./templates/${template}.html` : template;
}

Revoice.getTemplate = function (template = Revoice.DEFAULT_TEMPLATE) {
  return new Promise(function (resolve, reject) {
    fs.exists(Revoice.getTemplateUrl(template), function (fileExists) {
      if (fileExists) {
        fs.readFile(Revoice.getTemplateUrl(template), 'utf8', function (err, data) {
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
    // check all rules collecting all errors, the default is to return after the first error
    allErrors: true,
    schemas: [InvoiceSchema, ItemSchema],
  });
  const validate = ajv.compile(InvoiceSchema);
  const valid = validate(data);
  return valid ? true : validate.errors.map(errObj => errObj.message).join('; ');
}

Revoice.generateInvoice = function (data = {}, userOptions) {
  const options = {...Revoice.DEFAULT_OPTIONS, ...userOptions};
  return new Promise(function (resolve, reject) {

    // Validates the data object to ensure it has all the required fields
    const isValidInvoiceDataObject = Revoice.validateInvoiceDataObject(data);

    if (!isValidInvoiceDataObject) {
      reject(new Error(errorStrings.INVALID_DATA_OBJECT + ". " + isValidInvoiceDataObject))
    }

    // Get the template and substitute the values in
    Revoice.getTemplate(options.template)
      .then(res => {
        handlebars.registerHelper('sum', function () {
          return Array.prototype.reduce.call(arguments, function (a, n) {
            const x = parseFloat(n);
            return isNaN(x) ? a : a + x
          }, 0);
        });
        handlebars.registerHelper('product', function () {
          return Array.prototype.reduce.call(arguments, function (a, n) {
            const x = parseFloat(n);
            return isNaN(x) ? a : a * x
          }, 1);
        });
        handlebars.registerHelper('format', function (s) {
          return parseFloat(Math.round(s * 100) / 100).toFixed(2);
        });
        handlebars.registerHelper('subtotal', function (items = []) {
          return items.reduce(function (a, item) {
            return (a + (item.amount * item.quantity));
          }, 0);
        });
        handlebars.registerHelper('taxtotal', function (items = []) {
          return items.reduce(function (a, item) {
            return (a + (item.tax * item.quantity));
          }, 0);
        });
        handlebars.registerHelper('grandtotal', function (items = []) {
          return items.reduce(function (a, item) {
            return (a + ((item.amount + item.tax) * item.quantity));
          }, 0);
        });
        handlebars.registerHelper('currency', function (currency, amount) {
          return currencyFormatter.format(amount, { code: currency });
        });
        const template = handlebars.compile(res);
        const result = he.decode(template(data));
        resolve(result);
      })
      .catch(err => reject(err));
  });
}

Revoice.generateHTMLInvoice = function (data = {}, userOptions) {
  const options = {...Revoice.DEFAULT_OPTIONS, ...userOptions};
  return new Promise(function (resolve, reject) {
    let phInstance = null;
    Revoice.generateInvoice(data, options)
      .then(html => {
        return new Promise(function(resolve, reject) {
          fs.writeFile(`${options.destination}/index.html`, html, function (err, res) {
            if (err) reject(err);
            resolve();
          })
        })
      })
      .then(() => phantom.create())
      .then(instance => {
        phInstance = instance;
        return instance.createPage();
      })
      .then(page => {
        page.property('paperSize', {
          format: options.format || 'A3',
          orientation: options.orientation || 'portrait',
          margin: options.margin || '1cm',
        });
        page.property('settings.localToRemoteUrlAccessEnabled', true);
        page.property('settings.webSecurityEnabled', false);
        page.open('file://' + resolvePath(`${options.destination}/index.html`))
          .then(status => {
            if (status === 'fail') throw new Error('Failed to generate HTML output')
            return page.render(resolvePath(`${options.destination}/index.pdf`), {
              format: 'pdf'
            })
          })
          .then(() => {
            phInstance.exit();
            resolve();
          })
      })
      .catch(err => {
        reject(err);
        console.log(err);
        if (phInstance) phInstance.exit();
      });
  });
}

export default Revoice;