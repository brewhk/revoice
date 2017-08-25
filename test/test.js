import fs from 'fs';
import rimraf from 'rimraf';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiFs from 'chai-fs';
chai.use(chaiAsPromised);
chai.use(chaiFs);
const expect = chai.expect;

import randomstring from 'randomstring';

import Revoice from '../src/index.js';
// import Revoice from '../dist/app.js';

import ExtraInvoice from './sample/invoice/extra.json';
import ValidInvoice from './sample/invoice/valid.json';
import MinimumInvoice from './sample/invoice/minimum.json';
import ZeroItemsInvoice from './sample/invoice/no-items.json';

describe('Revoice', function() {
  describe('#getTemplateUrl()', function() {
    it('should exists', function() {
      expect(typeof Revoice.getTemplateUrl).to.be.equal('function');
    });
    it('should return a string', function() {
      expect(Revoice.getTemplateUrl()).to.be.a('string');
    });
    it('should return an the URL of the default template if no argument is supplied', function() {
      return expect(Revoice.getTemplateUrl()).to.include(Revoice.DEFAULT_TEMPLATE);
    });
    it('should return a path to the predefined template directory when an alphanumeric string is supplied', function() {
      const testString = randomstring.generate({
        charset: 'alphanumeric'
      });
      return expect(Revoice.getTemplateUrl(testString)).to.equal(`./templates/${testString}.html`);
    });
    it('should return the value passed in if it is not alphanumeric', function() {
      const testString = './test/sample/templates/test.html'
      return expect(Revoice.getTemplateUrl(testString)).to.equal(testString);
    });
  });
  describe('#getTemplate()', function() {
    it('should exists', function() {
      expect(typeof Revoice.getTemplate).to.be.equal('function');
    });
    it('should return a promise', function() {
      expect(Revoice.getTemplate()).to.be.a('promise');
    });
    it('should return the default template when none are supplied', function() {
      return expect(Revoice.getTemplate()).to.eventually.have.string('<!DOCTYPE html>');
    });
    it('should throw an error when the template could not be found', function() {
      return expect(Revoice.getTemplate(randomstring.generate())).to.eventually.be.rejectedWith(Error, "Template not found");
    });
    it('should allow user to specify their own template path', function() {
      return expect(Revoice.getTemplate('./test/sample/templates/test.html')).to.eventually.have.string('Q8lF9cWGBRay89xiYv5lOSjE13kJI09pGXrq5hYNdo48DBxHH5NlnIMjt111RGT');
    });
  });
  describe('#validateInvoiceDataObject()', function() {
    it('should exists', function() {
      expect(typeof Revoice.validateInvoiceDataObject).to.be.equal('function');
    });
    it('should return `true` or a string', function() {
      expect(Revoice.validateInvoiceDataObject()).to.satisfy(function (x) {
        return x === true || typeof x === 'string';
      });
    });
    it('should return a string when the required arguments are not supplied', function() {
      return expect(Revoice.validateInvoiceDataObject()).to.be.a('string');
    });
    it('should return a string when there are no items in the invoice', function() {
      return expect(Revoice.validateInvoiceDataObject(ZeroItemsInvoice)).to.be.a('string');
    });
    it('should return true when the minimum number of arguments are supplied', function() {
      return expect(Revoice.validateInvoiceDataObject(MinimumInvoice)).to.equal(true);
    });
    it('should return true when all arguments are supplied', function() {
      return expect(Revoice.validateInvoiceDataObject(ValidInvoice)).to.equal(true);
    });
    it('should return true when all arguments are supplied, even if there are extra fields', function() {
      return expect(Revoice.validateInvoiceDataObject(ExtraInvoice)).to.equal(true);
    });
  });
  describe('#generateInvoice()', function() {
    it('should exists', function() {
      expect(typeof Revoice.generateInvoice).to.be.equal('function');
    });
    it('should return a promise', function() {
      expect(Revoice.generateInvoice()).to.be.a('promise');
    });
    it('should throw an error when the template could not be found', function() {
      return expect(Revoice.generateInvoice({}, { template: randomstring.generate() })).to.eventually.be.rejectedWith(Error, "Template not found");
    });
    it('should return the default template when none are supplied', function() {
      return expect(Revoice.generateInvoice()).to.eventually.have.string('<!DOCTYPE html>');
    });
  });
  describe('#generateHTMLInvoice()', function () {
    before(function (done) {
      const path = './tmp';
      // Remove and re-created directory
      rimraf(path, function () {
        fs.mkdirSync(path);
        done();
      });
    });
    it('should exists', function() {
      expect(typeof Revoice.generateHTMLInvoice).to.be.equal('function');
    });
    it('should return a promise', function() {
      expect(Revoice.generateHTMLInvoice()).to.be.a('promise');
    });
    it('should throw an error when the template could not be found', function() {
      return expect(Revoice.generateHTMLInvoice({}, { template: randomstring.generate() })).to.eventually.be.rejectedWith(Error, "Template not found");
    });
    describe('should generate output from the default template when none are supplied', function () {
      before(function () {
        return Revoice.generateHTMLInvoice(ValidInvoice, { template: 'default' });
      });
      it('should generate a HTML file', function () {
        return expect('./tmp').to.be.a.directory().with.files(['index.html', 'index.pdf']);
      })
    });
  });
});
