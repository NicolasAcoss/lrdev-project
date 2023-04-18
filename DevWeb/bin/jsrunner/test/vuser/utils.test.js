'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

describe('utils', () => {
  let utils;

  beforeEach(() => {
    utils = proxyquire('./../../vuser/utils', {
    });
  });
  describe('Vuser Utils', () => {
    it('get error position', () => {
      utils.initialize(1, __dirname);
      const errorPosition = utils.getErrorPosition(new Error());
      expect(errorPosition).to.not.be.empty;
    });
    it('get error position linux style', () => {
      utils.initialize(1, __dirname.replace(/\\/g, '/'));
      const errorPosition = utils.getErrorPosition(new Error());
      expect(errorPosition).to.not.be.empty;
    });
  });
});