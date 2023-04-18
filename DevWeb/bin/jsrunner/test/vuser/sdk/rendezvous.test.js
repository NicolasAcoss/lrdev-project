const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const ErrorCodes = require('./../../../vuser/error_codes');

describe('rendezvous', () => {
  let load = {};
  let configMock = {};
  let message;
  let logUtils;
  let logUtilsStub;
  beforeEach(() => {
    configMock = {
      config: {
        user: {
          userId: 1
        },
        stage: 'action'
      },
      log: sinon.stub(),
      LogLevel: {
        error: 'error'
      }
    };

    message = {
      sendMessageSync: sinon.stub()
    };
    logUtils = {internalLog: sinon.stub(), LogLevel: sinon.stub()};

    logUtilsStub = function() {
      return logUtils;
    };

    load = proxyquire('./../../../vuser/sdk/rendezvous.js', {
      './../message.js': message,
      './../utils/log_utils.js': logUtilsStub
    })(configMock);
  });
  describe('call function with illegal inputs', () => {
    it('should fail call without a name (nil/undefined)', () => {
      expect(() => {
        load.rendezvous();
      }).to.throw(Error, 'You must provide a rendezvous name').with.property('code', ErrorCodes.sdk);
    });
    it('should fail call with empty string', () => {
      expect(() => {
        load.rendezvous('');
      }).to.throw(Error, 'You must provide a non empty rendezvous name').with.property('code', ErrorCodes.sdk);
    });
    it('should fail call with digit instead of string', () => {
      expect(() => {
        load.rendezvous(123);
      }).to.throw(Error, 'Rendezvous name must be string, but 123 was given').with.property('code', ErrorCodes.sdk);
    });
    it('should fail call with name that include spaces', () => {
      expect(() => {
        load.rendezvous('name 1');
      }).to.throw(Error, 'Rendezvous name must not contains spaces (position: 4)').with.property('code', ErrorCodes.sdk);
    });
    it('should not send sync message when not on action stage', () => {
      configMock.config.stage = 'init';
      load = proxyquire('./../../../vuser/sdk/rendezvous.js', {
        './../message.js': message,
        './../utils/log_utils.js': logUtilsStub
      })(configMock);
      load.rendezvous('name1');
      expect(message.sendMessageSync).to.not.have.been.called;
    });
  });
  describe('call function with legal inputs', () => {
    it('should notify rendezvous on action stage', () => {
      load.rendezvous('name1');
      expect(message.sendMessageSync).to.have.been.called;
    });
  });
});
