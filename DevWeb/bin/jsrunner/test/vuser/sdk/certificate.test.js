'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const ErrorCodes = require('./../../../vuser/error_codes');

describe('Certificate', () => {
  let load;
  let message;

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
    load = proxyquire('./../../../vuser/sdk/certificate.js', {
      './../message.js': message
    })(configStub);
  });

  it('should set certificate', () => {
    load.setUserCertificate('cert', 'key', 'pass');
    expect(message.sendMessageSync).to.have.been.calledOnce;
    const type = message.sendMessageSync.firstCall.args[0];
    const content = message.sendMessageSync.firstCall.args[2];
    expect(type).to.be.equal('Certificate.Set');
    expect(content.certFilePath).to.be.equal('cert');
    expect(content.keyFilePath).to.be.equal('key');
    expect(content.password).to.be.equal('pass');
  });
  it('should set certificate without password', () => {
    load.setUserCertificate('cert', 'key');
    expect(message.sendMessageSync).to.have.been.calledOnce;
    const content = message.sendMessageSync.firstCall.args[2];
    expect(content.certFilePath).to.be.equal('cert');
  });
  it('should set certificate without cert file', () => {
    expect(function() {
      load.setUserCertificate();
    }).to.throw(`certFilePath should not be empty`).with.property('code', ErrorCodes.sdk);
  });
  it('should set certificate without key file', () => {
    expect(function() {
      load.setUserCertificate('cert');
    }).to.throw(`keyFilePath should not be empty`).with.property('code', ErrorCodes.sdk);
  });

  it('should throw error on invalid certificate file path', () => {
    expect(function() {
      load.setUserCertificate('');
    }).to.throw('certFilePath should not be empty').with.property('code', ErrorCodes.sdk);
    expect(function() {
      load.setUserCertificate({a: 'a'});
    }).to.throw(`certFilePath must be a string but [object Object] was given`).with.property('code', ErrorCodes.sdk);
    expect(function() {
      load.setUserCertificate('cert', {a: 1});
    }).to.throw('keyFilePath must be a string but [object Object] was given').with.property('code', ErrorCodes.sdk);
  });
});