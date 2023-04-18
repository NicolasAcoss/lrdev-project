'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const Communicator = require('./../../bogatyr/communicator');
const {state, status} = require('./../../common/constants');

describe('communicator', () => {
  let communicator;
  describe('communicator constructor', () => {
    it('Should fail to use create new Communicator due to bad constructor arguments', () => {
      function communicatorConstructorError(host, port) {
        return `Bad argument passed: host ${host} must be string, port ${port} must be int`;
      }
      expect(() => {
        communicator = new Communicator({host: 'A', port: '1'});
      }).to.throws(communicatorConstructorError('A', '1'));
      expect(() => {
        communicator = new Communicator({host: 1, port: 1});
      }).to.throws(communicatorConstructorError(1, '1'));
      expect(() => {
        communicator = new Communicator({});
      }).to.throws(communicatorConstructorError(undefined, undefined));
    });
  });
  describe('initialize', () => {
    let promise;
    let promiseInitVuser;
    let communicationWorker;
    let onLogMessage;
    beforeEach(() => {
      onLogMessage = sinon.stub();
      communicator = new Communicator({
        port: 1,
        host: 'host',
        onLogMessage
      });
      promise = communicator.initialize();
      communicationWorker = communicator.communicationWorker;
      communicationWorker.postMessage = sinon.stub();
      promiseInitVuser = communicator.initVuser(1, 1, {});
    });
    afterEach(() => {
      communicator.stop();
    });
    it('online', (done) => {
      promise.then(() => {
        done();
      });
      communicationWorker.emit('online');
    });
    it('message init success', (done) => {
      promiseInitVuser.then((uid) => {
        expect(uid).to.be.equal(1);
        done();
      });
      communicationWorker.emit('message', {
        messageType: state.init,
        status: status.success,
        uid: 1
      });
    });

    it('message init fail', (done) => {
      promiseInitVuser.catch((err) => {
        expect(err.message).to.be.equal(`failed to initialize communicator aa`);
        done();
      });
      communicationWorker.emit('message', {
        messageType: state.init,
        status: status.failure,
        content: 'aa',
        uid: 1
      });
    });

    it('message log', (done) => {
      promise.then(() => {
        expect(onLogMessage).to.have.been.called;
        done();
      });
      communicationWorker.emit('message', {
        messageType: state.log,
        content: {}
      });
    });
  });
});
