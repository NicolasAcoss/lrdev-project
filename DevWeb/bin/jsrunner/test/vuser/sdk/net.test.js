const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const ErrorCodes = require('./../../../vuser/error_codes');
chai.use(sinonChai);

describe('Net', () => {
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
    load = proxyquire('./../../../vuser/sdk/net.js', {
      './../message.js': message
    })(configStub);
    configStub.net = load.net;
  });

  describe('DNS SRV functionality', () => {
    it('should lookup DNS srv', () => {
      message.sendMessageSync.returns({value: 'foo-x1x2x3.example.goo.net'});
      load.net.lookupService('foo', 'tcp', 'goo.koo.net');
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('should throw error for a non string parameter', () => {
      expect(() => {
        load.net.lookupService(1, 'tcp', 'goo.koo.net');
      }).to.throw('service must be a non empty string').with.property('code', ErrorCodes.sdk);
      expect(() => {
        load.net.lookupService('foo', '', 'goo.koo.net');
      }).to.throw('protocol must be a non empty string').with.property('code', ErrorCodes.sdk);
      expect(() => {
        load.net.lookupService('foo', 'tcp', {});
      }).to.throw('domain must be a non empty string').with.property('code', ErrorCodes.sdk);
    });
  });
});