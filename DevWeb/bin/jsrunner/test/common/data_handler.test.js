'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

describe('DataHandler', () => {
  let DataHandler;
  beforeEach(() => {
    DataHandler = proxyquire('./../../common/data_handler', {});
  });

  it('should create a data handler', () => {
    const handler = () => {};
    const dataHandler = new DataHandler(handler);
    expect(dataHandler).to.be.ok;
  });

  it('should get data handler and handle a message with a \n', (done) => {
    const handler = (data) => {
      expect(data).to.be.equal('FOO');
      done();
    };
    const dataHandler = new DataHandler(handler);
    dataHandler.getHandler()('FOO\n');
  });
  it('should get data handler and handle a split message with \n', (done) => {
    const handler = (data) => {
      expect(data).to.be.equal('FOO');
      done();
    };
    const dataHandler = new DataHandler(handler);
    const handlerFunc = dataHandler.getHandler();
    handlerFunc('F');
    handlerFunc('O');
    handlerFunc('O\n');
  });

  it('should get data handler and handle multiple messages', () => {
    const handler = sinon.stub();
    const dataHandler = new DataHandler(handler);
    const handlerFunc = dataHandler.getHandler();
    handlerFunc('F\n');
    handlerFunc('O\n');

    expect(handler).to.have.been.calledTwice;
  });

  it('should get data handler and handle multiple messages with split content', () => {
    const handler = sinon.stub();
    const dataHandler = new DataHandler(handler);
    const handlerFunc = dataHandler.getHandler();
    handlerFunc('F\nG');
    handlerFunc('O\n');

    expect(handler).to.have.been.calledTwice;
    expect(handler.getCall(1).args[0]).to.be.equal('GO');
  });
});
