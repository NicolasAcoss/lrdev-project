'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const Executor = require('./../../bogatyr/executor');
const {state, status} = require('./../../common/constants');
describe('executor', () => {
  const options = {
    onLogMessage: sinon.stub()
  };
  let executor;
  let promise;
  let executionWorker;
  beforeEach(() => {
    executor = new Executor(options);
    promise = executor.initVuser(1, 1, 1);
    executionWorker = executor.executionWorker;
    executionWorker.postMessage = sinon.stub();
  });
  afterEach(() => {
    executor.stop();
  });

  describe('execution init', () => {
    it('error', () => {
      executionWorker.emit('error', {message: 'error'});
      expect(options.onLogMessage).to.have.been.called;
    });
    it('online', () => {
      executionWorker.emit('online');
      expect(executionWorker.postMessage).to.have.been.called;
    });
    it('message init success', (done) => {
      promise.then(() => {
        done();
      });
      executionWorker.emit('message', {
        messageType: state.init,
        status: status.success
      });
    });
    it('message init fail', (done) => {
      promise.catch((err) => {
        expect(err.message).to.be.equal('failed to initialize executor A');
        done();
      });
      executionWorker.emit('message', {
        messageType: state.init,
        status: status.failure,
        content: 'A'
      });
    });
    it('message log', () => {
      executionWorker.emit('message', {
        messageType: state.log,
        content: {}
      });
      expect(options.onLogMessage).to.have.been.called;
    });
  });
  describe('execution run', () => {
    beforeEach(() => {
      promise = executor.run();
    });
    it('message create success', (done) => {
      promise.then(() => {
        done();
      });
      executionWorker.emit('message', {
        messageType: state.create,
        status: status.success
      });
    });
    it('message create error', (done) => {
      promise.catch((message) => {
        expect(message).to.be.equal('A');
        done();
      });
      executionWorker.emit('message', {
        messageType: state.create,
        status: status.failure,
        content: 'A'
      });
    });
  });
  describe('increase coverage', () => {
    it('should call executor functions successfully', () => {
      executor.runVuserStage();
      expect(executionWorker.postMessage).to.have.been.called;
    });
  });
});
