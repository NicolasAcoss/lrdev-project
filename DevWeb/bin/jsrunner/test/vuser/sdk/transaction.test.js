'use strict';

const {LoadError, ErrorTypes} = require('./../../../vuser/load_error.js');
const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const ErrorCodes = require('./../../../vuser/error_codes');

describe('Transaction', () => {
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
      },
      log: sinon.stub(),
      LogLevel: {
        error: 'error'
      }
    };
    load = proxyquire('./../../../vuser/sdk/transaction.js', {
      './../message.js': message
    })(configStub);
  });

  describe('constructor', () => {
    it('should create a transaction', () => {
      const transaction = new load.Transaction('foo');
      expect(transaction).not.to.be.undefined;
      expect(transaction.name).to.be.equal('foo');
      expect(transaction.state).to.be.equal(load.TransactionState.NotStarted);
    });

    it('should not create a transaction without a name', () => {
      expect(() => {
        const transaction = new load.Transaction();
        expect(transaction).to.be.undefined;
      }).to.throw('Transaction must have a none empty name').with.property('code', ErrorCodes.sdk);
    });

    it('should not create a transaction without a name', () => {
      expect(() => {
        const transaction = new load.Transaction('');
        expect(transaction).to.be.undefined;
      }).to.throw('Transaction must have a none empty name').with.property('code', ErrorCodes.sdk);
    });
  });

  describe('start', () => {
    it('should start the transaction', () => {
      const transaction = new load.Transaction('foo');
      message.sendMessageSync.returns({
        startTime: 123,
        state: load.TransactionState.InProgress
      });
      transaction.start();
      expect(transaction.state).to.be.equal(load.TransactionState.InProgress);
      expect(message.sendMessageSync).to.have.been.calledTwice;
    });

    it('should not start a transaction with empty name', () => {
      const transaction = new load.Transaction('foo');
      // noinspection JSConstantReassignment
      transaction.name = '';
      message.sendMessageSync.onCall(1).returns(
        new LoadError(ErrorTypes.transactions, 'Cannot create transaction with empty name')
      );
      expect(() => {
        transaction.start();
      }).to.throw('Cannot create transaction with empty name');
    });

    it('should start a transaction after it was ended', () => {
      const transaction = new load.Transaction('foo');
      message.sendMessageSync.onCall(1).returns({
        startTime: 123,
        state: load.TransactionState.InProgress
      });
      message.sendMessageSync.onCall(2).returns({
        startTime: 123,
        state: load.TransactionState.Ended,
        duration: 12,
        status: 'AAA'
      });

      message.sendMessageSync.onCall(3).returns({
        startTime: 1235,
        state: load.TransactionState.InProgress
      });

      transaction.start();
      transaction.stop();
      transaction.start();
      expect(transaction.startTime).to.be.equal(1235);
      expect(transaction.status).to.be.undefined;
      expect(transaction.duration).to.be.undefined;
      expect(transaction.state).to.be.equal(load.TransactionState.InProgress);
    });
  });

  describe('stop', () => {
    it('should stop a transaction and get the status', () => {
      const transaction = new load.Transaction('foo');
      message.sendMessageSync.onCall(1).returns({
        startTime: 123,
        state: load.TransactionState.InProgress
      });
      message.sendMessageSync.onCall(2).returns({
        status: load.TransactionStatus.Passed,
        state: load.TransactionState.Ended,
        duration: 12
      });

      transaction.start();
      transaction.stop();
      expect(transaction.status).to.be.equal(load.TransactionStatus.Passed);
      expect(transaction.duration).to.be.equal(12);
      expect(message.sendMessageSync).to.have.been.callCount(3);
    });

    it('should not stop a transaction with incorrect status', () => {
      const transaction = new load.Transaction('foo');
      transaction.state = load.TransactionState.InProgress;
      expect(() => {
        transaction.stop('bar');
      }).to.throw('Transaction can be stopped with either Passed or Failed status but bar was sent').with.property('code', ErrorCodes.sdk);
      expect(message.sendMessageSync).not.to.have.been.calledTwice;
    });

    it('should not stop a transaction with incorrect status', () => {
      const transaction = new load.Transaction('foo');
      message.sendMessageSync.returns({
        startTime: 123,
        status: load.TransactionStatus.Passed,
        duration: 12
      });
      transaction.start();
      expect(() => {
        transaction.stop('Monkey');
      }).to.throw('Transaction can be stopped with either Passed or Failed status but Monkey was sent').with.property('code', ErrorCodes.sdk);
      expect(message.sendMessageSync).to.have.been.calledTwice;
    });
  });

  describe('set', () => {
    it('should set a passing transaction', () => {
      const transaction = new load.Transaction('foo');
      message.sendMessageSync.returns({
        startTime: 123,
        status: load.TransactionStatus.Passed,
        duration: 123
      });
      transaction.set(load.TransactionStatus.Passed, 123);
      expect(transaction.status).to.be.equal(load.TransactionStatus.Passed);
      expect(transaction.duration).to.be.equal(123);
      expect(message.sendMessageSync).to.have.been.calledTwice;
    });

    it('should set a failing transaction', () => {
      const transaction = new load.Transaction('foo');
      message.sendMessageSync.returns({
        startTime: 123,
        status: load.TransactionStatus.Failed,
        duration: 123
      });
      transaction.set(load.TransactionStatus.Failed, 123);
      expect(transaction.status).to.be.equal(load.TransactionStatus.Failed);
      expect(transaction.duration).to.be.equal(123);
      expect(message.sendMessageSync).to.have.been.calledTwice;
    });

    it('should not set a transaction with incorrect status argument', () => {
      const transaction = new load.Transaction('foo');
      message.sendMessageSync.returns({
        startTime: 123,
        status: load.TransactionStatus.Failed,
        duration: 234
      });
      expect(() => {
        transaction.set('Something bad', 234);
      }).to.throw('Transaction can be stopped with either Passed or Failed status but Something bad was sent').with.property('code', ErrorCodes.sdk);
      expect(message.sendMessageSync).not.to.have.been.calledTwice;
    });

    it('should not set a transaction with incorrect duration argument', () => {
      const transaction = new load.Transaction('foo');
      message.sendMessageSync.returns({
        startTime: 123,
        status: load.TransactionStatus.Failed,
        duration: 123
      });
      expect(() => {
        transaction.set(load.TransactionStatus.Passed, 'hello');
      }).to.throw('Duration must be a non negative number but hello was sent').with.property('code', ErrorCodes.sdk);
      expect(message.sendMessageSync).not.to.have.been.calledTwice;
    });

    it('should not set a transaction with negative duration', () => {
      const transaction = new load.Transaction('foo');
      message.sendMessageSync.returns({
        startTime: 123,
        status: load.TransactionStatus.Failed,
        duration: 123
      });
      expect(() => {
        transaction.set(load.TransactionStatus.Passed, -10);
      }).to.throw('Duration must be a non negative number but -10 was sent').with.property('code', ErrorCodes.sdk);
      expect(message.sendMessageSync).not.to.have.been.calledTwice;
    });
  });

  describe('update', () => {
    it('should get the status of a running transaction', () => {
      const transaction = new load.Transaction('foo');
      message.sendMessageSync.returns({
        startTime: 123,
        status: load.TransactionStatus.Passed,
        duration: 123,
        state: load.TransactionState.InProgress
      });
      transaction.start();
      transaction.update();
      expect(transaction.status).to.be.equal(load.TransactionStatus.Passed);
    });

    it('should get the existing status of an ended transaction', () => {
      const transaction = new load.Transaction('foo');
      message.sendMessageSync.onCall(1).returns({
        startTime: 123,
        state: load.TransactionState.InProgress
      });
      message.sendMessageSync.onCall(2).returns({
        status: load.TransactionStatus.Passed,
        state: load.TransactionState.Ended,
        duration: 12
      });
      transaction.start();
      transaction.stop();
      transaction.status = 'AAA';
      transaction.update();
      expect(transaction.status).to.be.equal('AAA');
    });
  });
});
