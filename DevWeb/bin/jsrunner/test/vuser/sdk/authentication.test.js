'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const ErrorCodes = require('./../../../vuser/error_codes');

describe('Authentication', () => {
  let load;
  let message;
  let logUtils;

  beforeEach(() => {
    message = {
      sendMessageSync: sinon.stub()
    };
    const configStub = {
      log: sinon.stub(),
      LogLevel: {
        error: 'error'
      },
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

    load = proxyquire('./../../../vuser/sdk/authentication.js', {
      './../message.js': message,
      './../utils/log_utils.js': logUtilsStub
    })(configStub);
  });

  it('should add a single authentication record', () => {
    load.setUserCredentials({
      username: 'john',
      password: 'doe',
      host: 'www.foo.bar'
    });

    expect(message.sendMessageSync).to.have.been.calledOnce;
    const content = message.sendMessageSync.firstCall.args[2];
    expect(content.length).to.be.equal(1);
  });

  it('should add multiple authentication records', () => {
    load.setUserCredentials([
      {
        username: 'john',
        password: 'doe',
        host: 'www.foo.bar'
      }, {
        username: 'crusty',
        password: 'clown',
        host: 'www.foo.bar'
      }]);

    expect(message.sendMessageSync).to.have.been.calledOnce;
    const content = message.sendMessageSync.firstCall.args[2];
    expect(content.length).to.be.equal(2);
  });

  it('should not add an authentication record without a username', () => {
    load.setUserCredentials([
      {
        username: 'john',
        password: 'doe',
        host: 'www.foo.bar'
      }, {
        password: 'clown',
        host: 'www.foo.bar'
      }]);

    expect(message.sendMessageSync).to.have.been.calledOnce;
    const content = message.sendMessageSync.firstCall.args[2];
    expect(content.length).to.be.equal(1);
    expect(content[0].credentials.username).to.be.equal('john');
    const errCode = logUtils.internalLog.firstCall.args[2];
    expect(errCode).to.be.equal(ErrorCodes.sdk);
  });

  it('should not add an authentication record without a password', () => {
    load.setUserCredentials([
      {
        username: 'john',
        host: 'www.foo.bar'
      }, {
        username: 'crusty',
        password: 'clown',
        host: 'www.foo.bar'
      }]);

    expect(message.sendMessageSync).to.have.been.calledOnce;
    const content = message.sendMessageSync.firstCall.args[2];
    expect(content.length).to.be.equal(1);
    expect(content[0].credentials.username).to.be.equal('crusty');
    const errCode = logUtils.internalLog.firstCall.args[2];
    expect(errCode).to.be.equal(ErrorCodes.sdk);
  });

  it('should not add an authentication record without a host', () => {
    load.setUserCredentials([
      {
        username: 'john',
        password: 'doe',
        host: 'www.foo.bar'
      }, {
        username: 'crusty',
        password: 'clown'
      }]);

    expect(message.sendMessageSync).to.have.been.calledOnce;
    const content = message.sendMessageSync.firstCall.args[2];
    expect(content.length).to.be.equal(1);
    expect(content[0].credentials.username).to.be.equal('john');
    const errCode = logUtils.internalLog.firstCall.args[2];
    expect(errCode).to.be.equal(ErrorCodes.sdk);
  });

  describe('AWSAuthentication', () => {
    it('should add a aws authentication record', () => {
      const awsAuthentication = new load.AWSAuthentication(load.AWSProviderType.Env);
      load.setUserCredentials(awsAuthentication);

      expect(message.sendMessageSync).to.have.been.calledOnce;
      const content = message.sendMessageSync.firstCall.args[2];
      expect(content.length).to.be.equal(1);
    });

    it('should throw error for AWSAuthentication without provider', () => {
      expect(() => {
        const awsAuthentication = new load.AWSAuthentication();
        load.setUserCredentials(awsAuthentication);
      }).to.throw('provider type must be a string but undefined was passed').with.property('code', ErrorCodes.sdk);
    });

    it('should throw error for static AWSAuthentication without an options', () => {
      expect(() => {
        const awsAuthentication = new load.AWSAuthentication(load.AWSProviderType.Static, {});
        load.setUserCredentials(awsAuthentication);
      }).to.throw('options must be provided for static provider type').with.property('code', ErrorCodes.sdk);
    });

    it('should throw error for static AWSAuthentication without a key', () => {
      expect(() => {
        const awsAuthentication = new load.AWSAuthentication(load.AWSProviderType.Static, {accessKeyID: 1});
        load.setUserCredentials(awsAuthentication);
      }).to.throw('accessKeyID cannot be empty for static provider type').with.property('code', ErrorCodes.sdk);
    });
  });
});
