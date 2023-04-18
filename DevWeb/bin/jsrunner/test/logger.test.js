'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

describe('logger', () => {
  let logger;
  const consoleStub = {};

  beforeEach(() => {
    consoleStub.log = sinon.stub();
    logger = proxyquire('./../logger.js', {
      './console.js': consoleStub
    });
    logger.showInConsole = true;
  });

  it('should set log level info', () => {
    logger.setLevel('info');
    logger.info('Info Message');
    sinon.assert.called(consoleStub.log);
    expect(consoleStub.log.getCall(0).args[0]).to.be.include('Info Message');
  });

  it('should set log level debug', () => {
    logger.setLevel('debug');
    logger.debug('Debug Message');
    sinon.assert.called(consoleStub.log);
    expect(consoleStub.log.getCall(0).args[0]).to.be.include('Debug Message');
  });

  it('should set log level warning', () => {
    logger.setLevel('warning');
    logger.warning('Warning Message');
    sinon.assert.called(consoleStub.log);
    expect(consoleStub.log.getCall(0).args[0]).to.be.include('Warning Message');
  });

  it('should set log level error', () => {
    logger.setLevel('error');
    logger.error('Error Message');
    sinon.assert.called(consoleStub.log);
    expect(consoleStub.log.getCall(0).args[0]).to.be.include('Error Message');
  });

  it('should set log level trace', () => {
    logger.setLevel('trace');
    logger.trace('Trace Message');
    sinon.assert.called(consoleStub.log);
    expect(consoleStub.log.getCall(0).args[0]).to.be.include('Trace Message');
  });

  it('should set default log level', () => {
    logger.setLevel('NotValid');
    logger.info('Message1');
    logger.debug('Message2'); // debug will be ignored since the default is info
    logger.warning('Message3');
    logger.error('Message4');
    expect(consoleStub.log.getCall(0).args[0]).to.be.include('Message1');
    expect(consoleStub.log.getCall(1).args[0]).to.be.include('Message3');
    expect(consoleStub.log.getCall(2).args[0]).to.be.include('Message4');
  });
});
