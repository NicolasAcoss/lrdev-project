'use strict';

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const validators = require('./../../../utils/validator.js');
chai.use(sinonChai);

describe('Request Utils', () => {
  let configStub;
  let requestUtils;
  let logUtils;

  beforeEach(() => {
    configStub = {
      extractors: {},
      config: {
        user: {
          userId: 10
        }
      }
    };
    logUtils = {internalLog: sinon.stub(), LogLevel: sinon.stub()};

    const logUtilsStub = function() {
      return logUtils;
    };

    requestUtils = proxyquire('./../../../vuser/utils/request_utils.js', {
      './../../utils/validator.js': validators,
      './../utils/log_utils.js': logUtilsStub
    })(configStub);
  });

  describe('escapeCharCleaner Unit Tests', () => {
    /**
     * Test the logic of escapeCharCleaner, we should replace only two espace char,
     * otherwise we should remain the smae.
     */
    it('single backslash should be remain single backslash after escapeCharCleaner', () => {
      const body = requestUtils.escapeCharCleaner('{\"name\":\"devweb\"}"'); // eslint-disable-line
      expect(body).to.be.equal('{\"name\":\"devweb\"}"'); // eslint-disable-line
    });

    it('two backslashes should be remain two backslash after escapeCharCleaner', () => {
      const body = requestUtils.escapeCharCleaner('{\"name\":\"\\devweb\\devweb\"}'); // eslint-disable-line
      expect(body).to.be.equal('{\"name\":\"\\devweb\\devweb\"}'); // eslint-disable-line
    });

    it('triple backslashes should be remain triple backslash after escapeCharCleaner', () => {
      const body = requestUtils.escapeCharCleaner('{\"name\":\"\\\devweb\\\devweb\"}'); // eslint-disable-line
      expect(body).to.be.equal('{\"name\":\"\\\devweb\\\devweb\"}'); // eslint-disable-line
    });

    /**
     * This keeps Boris fix to support LRE use case.
     */
    it('four backslashes should be two backslash after escapeCharCleaner', () => {
      const body = requestUtils.escapeCharCleaner('{\"name\":\"dev\\\\web\"}'); // eslint-disable-line
      expect(body).to.be.equal('{\"name\":\"dev\\web\"}'); // eslint-disable-line
    });

    it('six backslashes should be remain six backslash after escapeCharCleaner', () => {
      const body = requestUtils.escapeCharCleaner('{\"name\":\"dev\\\\\\web\"}'); // eslint-disable-line
      expect(body).to.be.equal('{\"name\":\"dev\\\\\\web\"}'); // eslint-disable-line 
    });
  });

  describe('handleRequestExtractors', () => {
    const extractors = require('./../../../vuser/sdk/extractors')(configStub);
    it('should generate an array out of an object', () => {
      const extractor = new extractors.BoundaryExtractor('Foo', 'LB', 'RB');
      const request = {
        extractors: extractor
      };
      requestUtils.handleRequestExtractors(request);
      expect(request.extractors).length(1);
      expect(request.extractors[0]).equal(extractor);
    });

    it('should fail if the value is not a valid extractor', () => {
      const extractor = 'not extractor';
      const request = {
        extractors: [extractor]
      };

      const oldIsExtractor = validators.specific.isExtractor;
      validators.specific.isExtractor = sinon.stub().returns(false);
      expect(() => {
        requestUtils.handleRequestExtractors(request);
      }).to.throw('extractors must be an array of Extractor');
      validators.specific.isExtractor = oldIsExtractor;
    });

    it('extractors proxy', () => {
      const extractor = {type: 'boundary', name: 'kuku', options: {}};
      const request = {
        extractors: [extractor]
      };

      const responseData = {
        extractors: {kuku: 'muku'}
      };

      const webResponse = {
        extractors: {}
      };

      requestUtils.shouldLogExtractorsSubstitution = sinon.stub().returns(true);
      requestUtils.handleResponseExtractors(request, responseData, webResponse);
      expect(webResponse.extractors['kuku']).equal('muku');
    });
  });
});
