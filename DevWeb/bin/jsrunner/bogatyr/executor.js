'use strict';

const worker = require('worker_threads');
const path = require('path');
const consts = require('./../common/constants.js');
const messages = require('./internal/message.js');

class Executor {
  constructor(options) {
    this.onLogMessage = options.onLogMessage;
  }

  initVuser(uid, messagePort, mutex) {
    return new Promise((resolve, reject) => {
      this.uid = uid;
      this.executionWorker = new worker.Worker(path.join(__dirname, 'internal', 'execution_thread.js'));
      this.executionWorker.on('message', (message) => {
        switch (message.messageType) {
          case consts.state.init: {
            if (message.status === consts.status.success) {
              resolve();
            } else {
              reject(new Error(`failed to initialize executor ${message.content}`));
            }
            break;
          }
          case consts.state.log: {
            this.onLogMessage(message.content.message, message.content.level);
          }
        }
      });
      this.executionWorker.on('online', () => {
        this.executionWorker.postMessage({
          uid,
          messageType: consts.state.init,
          port: messagePort,
          mutex
        }, [messagePort]);
      });
      this.executionWorker.on('error', (err) => {
        //There is nothing that can be done here, the Phoenix controller needs to kill this user
        this.onLogMessage(err.message, consts.logLevel.error);
      });
    });
  }

  run(vuserConfiguration) {
    return new Promise((resolve, reject) => {
      this.executionWorker.on('message', (message) => {
        if (message.messageType === consts.state.create) {
          if (message.status === consts.status.success) {
            resolve();
          } else {
            reject(message.content);
          }
        }
      });
      this.executionWorker.postMessage(messages.createMessage(this.uid, consts.state.run, consts.status.start, vuserConfiguration));
    });
  }

  runVuserStage(args) {
    this.executionWorker.postMessage(messages.createMessage(this.uid, consts.state.stage, consts.status.start, args));
  }

  stop() {
    return this.executionWorker.terminate();
  }
}

module.exports = Executor;
