'use strict';

const {isString, isEmpty, isUndefined, isNumber} = require('./../../utils/validator.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');
const message = require('./../message.js');

module.exports = function(load) {
  const TransactionStatus = {
    Passed: 'Passed',
    Failed: 'Failed'
  };

  const TransactionState = {
    InProgress: 'InProgress',
    NotStarted: 'NotStarted',
    Ended: 'Ended'
  };

  class Transaction {
    constructor(name) {
      if (!isString(name) || isEmpty(name)) {
        throw new LoadError(ErrorTypes.transactions, 'Transaction must have a none empty name', null, ErrorCodes.sdk);
      }
      this.name = name;
      this.state = TransactionState.NotStarted;
      const response = message.sendMessageSync('Transaction.Created', load.config.user.userId, {name: name});
      if (response instanceof LoadError) {
        throw response;
      }
    }

    start() {
      const response = message.sendMessageSync('Transaction.Start', load.config.user.userId, {
        name: this.name
      });
      if (response instanceof LoadError) {
        throw response;
      }
      delete this.status;
      delete this.duration;
      this.startTime = response.startTime;
      this.state = response.state;
    }

    stop(status) {
      if (isUndefined(status) || status === TransactionStatus.Failed || status === TransactionStatus.Passed) {
        const response = message.sendMessageSync('Transaction.End', load.config.user.userId, {
          name: this.name, status: status
        });
        if (response instanceof LoadError) {
          throw response;
        }
        this.duration = response.duration;
        this.status = response.status;
        this.state = response.state;
      } else {
        throw new LoadError(ErrorTypes.transactions, `Transaction can be stopped with either ${TransactionStatus.Passed} or ${TransactionStatus.Failed} status but ${status} was sent`, null, ErrorCodes.sdk);
      }
    }

    'set'(status, duration) {
      if (status !== TransactionStatus.Passed && status !== TransactionStatus.Failed) {
        throw new LoadError(ErrorTypes.transactions, `Transaction can be stopped with either ${TransactionStatus.Passed} or ${TransactionStatus.Failed} status but ${status} was sent`, null, ErrorCodes.sdk);
      }
      if (!isNumber(duration) || Number(duration) < 0) {
        throw new LoadError(ErrorTypes.transactions, `Duration must be a non negative number but ${duration} was sent`, null, ErrorCodes.sdk);
      }
      const response = message.sendMessageSync('Transaction.Set', load.config.user.userId, {
        name: this.name,
        duration,
        status
      });
      if (response instanceof LoadError) {
        throw response;
      }
      this.state = response.state;
      this.duration = response.duration;
      this.status = response.status;
    }

    update() {
      if (this.state === TransactionState.Ended) {
        return this;
      }

      const response = message.sendMessageSync('Transaction.Status', load.config.user.userId, {
        name: this.name
      });
      if (response instanceof LoadError) {
        throw response;
      }
      this.duration = response.duration;
      this.state = response.state;
      this.status = response.status;

      return this;
    }
  }

  return {
    Transaction,
    TransactionStatus,
    TransactionState
  };
};
