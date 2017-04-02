import fs from 'fs';
import handlebars from 'handlebars';
import he from 'he';

import Ajv from 'ajv';
import phantom from 'phantom';

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
  format: 'A4',
  orientation: 'portrait',
  margin: '1cm',
}

Revoice.getTemplate = function (template = Revoice.DEFAULT_TEMPLATE) {
  return new Promise(function (resolve, reject) {
    fs.exists(_getTemplateUrl(template), function (fileExists) {
      if (fileExists) {
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
    schemas: [InvoiceSchema, ItemSchema],
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
          switch (currency) {
            case "GBP":
              return '£' + amount;
              break;
            default:
              return amount;
          }
        });
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
        fs.writeFile("tmp/index.html", html, function (err, res) {
          if (err) {
            reject(err);
          } else {
            let phInstance = null;
            phantom.create()
              .then(instance => {
                phInstance = instance;
                return instance.createPage();
              })
              .then(page => {
                page.property('paperSize', {
                  format: options.format || 'A4',
                  orientation: options.orientation || 'portrait',
                  margin: options.margin || '1cm',
                });
                page.property('settings.localToRemoteUrlAccessEnabled', true);
                page.property('settings.webSecurityEnabled', false);
                page.open('file://' + __dirname + '/../tmp/index.html')
                  .then(status => {
                    return page.render(__dirname + '/../tmp/index.pdf', {
                      format: 'pdf'
                    })
                  })
                  .then(() => {
                    phInstance.exit();
                    resolve();
                  })
              })
            .catch(error => {
                console.log(error);
                phInstance.exit();
            });
          }
        })
      })
      .catch(err => reject(err));
  });
}

export default Revoice;