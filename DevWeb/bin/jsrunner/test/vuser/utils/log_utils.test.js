'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const path = require('path');
const StackedError = require('./../../../vuser/stacked_error.js');
const utils = require('./../../../vuser/utils.js');
const expect = chai.expect;
chai.use(sinonChai);

describe('Log Utils', () => {
  let logUtils;
  let message;
  let configStub;

  beforeEach(() => {
    message = {
      sendMessage: sinon.stub(),
      sendMessageSync: sinon.stub(),
      sendMessageSyncNoResponse: sinon.stub()
    };
    configStub = {
      config: {
        user: {
          userId: 10
        },
        script: {
          directory: __dirname
        }
      },
      log: sinon.stub()
    };

    logUtils = proxyquire('./../../../vuser/utils/log_utils.js', {
      './../message.js': message
    })(configStub);
    //const utils = require('./../../../vuser/utils');
    utils.initialize('info', __dirname);
  });

  describe('internalLog', () => {
    it('should send a log message with default log level', () => {
      logUtils.internalLog('MyMessage');
      expect(message.sendMessageSyncNoResponse).to.have.been.calledOnce;
      const content = message.sendMessageSyncNoResponse.firstCall.args[2];
      expect(content.message).to.be.equal('MyMessage');
      expect(content.level).to.be.equal(logUtils.LogLevel.info);
    });

    it('should send a log message with a given log level', () => {
      logUtils.internalLog('MyMessage2', logUtils.LogLevel.debug);
      expect(message.sendMessageSyncNoResponse).to.have.been.calledOnce;
      const content = message.sendMessageSyncNoResponse.firstCall.args[2];
      expect(content.message).to.be.equal('MyMessage2');
      expect(content.level).to.be.equal(logUtils.LogLevel.debug);
    });

    it('should send a log message with an object', () => {
      const obj = {x: 'a'};
      logUtils.internalLog(obj);
      expect(message.sendMessageSyncNoResponse).to.have.been.calledOnce;
      const content = message.sendMessageSyncNoResponse.firstCall.args[2];
      expect(content.message).to.be.equal(JSON.stringify(obj));
      expect(content.level).to.be.equal(logUtils.LogLevel.info);
    });

    it('should send a log message with an object', () => {
      const obj = {x: 'a'};
      logUtils.internalLog(obj);
      expect(message.sendMessageSyncNoResponse).to.have.been.calledOnce;
      const content = message.sendMessageSyncNoResponse.firstCall.args[2];
      expect(content.message).to.be.equal(JSON.stringify(obj));
      expect(content.level).to.be.equal(logUtils.LogLevel.info);
    });
    it('should send a log message with an error', () => {
      const obj = new Error('Oh no!');
      logUtils.internalLog(obj);
      expect(message.sendMessageSyncNoResponse).to.have.been.calledOnce;
      const content = message.sendMessageSyncNoResponse.firstCall.args[2];
      const source = message.sendMessageSyncNoResponse.firstCall.args[3];
      expect(content.message.startsWith(`Oh no!`)).to.be.true;
      expect(content.level).to.be.equal(logUtils.LogLevel.info);
      expect(source.startsWith(`(.${path.sep}log_utils.test.js`)).to.be.true;
    });

    it('should send a log message with a stacked error', () => {
      const obj = new StackedError('Foo!', new Error(''));
      logUtils.internalLog(obj);
      expect(message.sendMessageSyncNoResponse).to.have.been.calledOnce;
      const content = message.sendMessageSyncNoResponse.firstCall.args[2];
      const source = message.sendMessageSyncNoResponse.firstCall.args[3];
      expect(content.message.startsWith(`Foo!`)).to.be.true;
      expect(content.level).to.be.equal(logUtils.LogLevel.info);
      expect(source.startsWith(`(.${path.sep}log_utils.test.js`)).to.be.true;
    });

    it('should send a log message with an error but incorrect path', () => {
      const obj = new StackedError('Foo!', new Error(''));
      //configStub.config.script.directory = 'Basasababa';
      utils.initialize('info', 'Basasababa');
      logUtils.internalLog(obj);
      expect(message.sendMessageSyncNoResponse).to.have.been.calledOnce;
      const content = message.sendMessageSyncNoResponse.firstCall.args[2];
      const source = message.sendMessageSyncNoResponse.firstCall.args[3];
      expect(content.message.startsWith(`Foo!`)).to.be.true;
      expect(content.level).to.be.equal(logUtils.LogLevel.info);
      expect(source).to.be.equal('');
    });
  });
});
