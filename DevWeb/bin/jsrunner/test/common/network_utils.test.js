'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const expect = chai.expect;

describe('Network Utils', () => {
  let networkUtils;
  beforeEach(() => {
    networkUtils = proxyquire('./../../common/network_utils', {});
  });

  it('should create a status message', () => {
    const message = networkUtils.createStatusMessage('type', 'state', 'message', 'status');
    expect(message).to.be.ok;
    expect(message.messageType).to.be.equal('type');
    expect(message.content).to.be.ok;
    expect(message.content.message).to.be.equal('message');
  });

  it('should create a log message', () => {
    const message = networkUtils.createLogMessage('foo', 'bar');
    expect(message).to.be.ok;
    expect(message.messageType).to.be.equal('Engine.Log');
    expect(message.content).to.be.ok;
    expect(message.content.message).to.be.equal('foo');
  });

  it('should convert an object to a message', () => {
    const obj = { foo: 'bar' };
    const message = networkUtils.objectToMessage(obj);
    expect(message.indexOf('\n')).to.be.equal(message.length - 1);
  });
});
