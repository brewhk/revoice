import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;

import randomstring from 'randomstring';

import Revoice from '../src/index.js';
// import Revoice from '../dist/app.js';

describe('Revoice', function() {
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
  });
  describe('#generate()', function() {
    it('should exists', function() {
      expect(typeof Revoice.generate).to.be.equal('function');
    });
    it('should throw an error when the template could not be found', function() {
      return expect(Revoice.generate(randomstring.generate())).to.eventually.be.rejectedWith(Error, "Template not found");
    });
    it('should return the default template when none are supplied', function() {
      return expect(Revoice.generate()).to.eventually.have.string('<!DOCTYPE html>');
    });
  });
});
