const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const ErrorCodes = require('../../../vuser/error_codes');
chai.use(sinonChai);

describe('Azure', () => {
  let load;
  let message;

  beforeEach(() => {
    message = {
      sendMessageSync: sinon.stub()
    };
    const configStub = {
      config: {
        user: {
          userId: 10
        }
      }
    };
    load = proxyquire('./../../../vuser/sdk/azure.js', {
      './../message.js': message
    })(configStub);
    configStub.azure = load.azure;
  });

  describe('Azure KeyVault Tests', () => {
    it('should getToken', () => {
      message.sendMessageSync.returns({value: '23232323232'});
      load.azure.getToken('foo', 'bar', 'bla', 'foo');
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('test getSecret', () => {
      message.sendMessageSync.returns({value: 'secretValue'});
      load.azure.getSecret('devwebpass', '3232323232');
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('check for empty string', () => {
      expect(() => {
        load.azure.getToken('vaultName', 'tenantId', 'clientId', '');
      }).to.throw('clientSecret must be a non empty string').with.property('code', ErrorCodes.sdk);
      expect(() => {
        load.azure.getToken('vaultName', 'tenantId', '', 'clientSecret');
      }).to.throw('clientId must be a non empty string').with.property('code', ErrorCodes.sdk);
      expect(() => {
        load.azure.getSecret('', '32323232');
      }).to.throw('secret must be a non empty string').with.property('code', ErrorCodes.sdk);
      expect(() => {
        load.azure.getSecret('secret', '');
      }).to.throw('token must be a non empty string').with.property('code', ErrorCodes.sdk);
    });
  });
});