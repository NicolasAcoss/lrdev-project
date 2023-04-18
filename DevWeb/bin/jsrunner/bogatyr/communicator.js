'use strict';

const worker = require('worker_threads');
const path = require('path');
const {isInteger, isString} = require('./../utils/validator.js');

const consts = require('./../common/constants.js');

class Communicator {
  constructor({host, port, onLogMessage}) {
    if (!isInteger(port) ||
      !isString(host)) {
      throw new Error(`Bad argument passed: host ${host} must be string, port ${port} must be int`);
    }
    this.runlogicHost = host;
    this.runlogicPort = port;
    this.onLogMessage = onLogMessage;
    this.initPromises = new Map();
  }

  initialize() {
    return new Promise((resolve) => {
      this.communicationWorker = new worker.Worker(path.join(__dirname, 'internal', 'communication_thread.js'));
      this.communicationWorker.on('online', () => {
        resolve();
      });
      this.communicationWorker.on('message', (message) => {
        switch (message.messageType) {
          case consts.state.init: {
            const promiseResult = this.initPromises.get(message.uid);
            if (message.status === consts.status.success) {
              promiseResult.resolve(message.uid);
            } else {
              promiseResult.reject(new Error(`failed to initialize communicator ${message.content}`));
            }
            this.initPromises.delete(message.uid);
            break;
          }
          case consts.state.log: {
            this.onLogMessage(message.content.message, message.content.level);
          }
        }
      });
    });
  }

  initVuser(uid, messagePort, mutex) {
    return new Promise((resolve, reject) => {
      this.initPromises.set(uid, {
        resolve,
        reject
      });
      this.communicationWorker.postMessage({
        uid,
        messageType: consts.state.init,
        port: messagePort,
        mutex,
        runlogicHost: this.runlogicHost,
        runlogicPort: this.runlogicPort
      }, [messagePort]);
    });
  }

  stop() {
    return this.communicationWorker.terminate();
  }
}

module.exports = Communicator;
