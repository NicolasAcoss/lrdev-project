'use strict';

const worker = require('worker_threads');
const {isUndefined} = require('./../../utils/validator.js');
const {DualMutex} = require('./mutex.js');
const messages = require('./message.js');
const consts = require('./../../common/constants.js');
const CallbackError = require('./../../vuser/callback_error.js');

process.on('unhandledRejection', (reason) => {
  if (reason instanceof CallbackError) {
    log('Iteration ended before asynchronous send() completion', consts.logLevel.error);
  }
});

function clearSocketData(socketData) {
  if (socketData.barrierTimeout !== null && socketData.barrierTimeout !== undefined) {
    clearTimeout(socketData.barrierTimeout);
  }
  socketData.barrierTimeout = null;
  socketData.barrier = null;
  socketData.barrierResolve = null;
  socketData.barrierReject = null;

  if (socketData.closeTimeout !== null && socketData.closeTimeout !== undefined) {
    clearTimeout(socketData.closeTimeout);
  }
  socketData.closeTimeout = null;
  socketData.closeBarrier = null;
  socketData.closeResolve = null;
  socketData.closeReject = null;
}

class Executor {
  constructor(uid, port, mutex) {
    this.uid = uid;
    this.port = port;
    this.mutex = DualMutex.connect(mutex);
    this.pendingCallbacks = new Map();

    this.pendingTimers = new Map();
    this.nextTimerId = 1;

    this.sockets = new Map();

    port.on('message', (message) => {
      switch (message.messageType) {
        case 'sendSync': {
          log(`Should not get here ${JSON.stringify(message)}`, consts.logLevel.error);
          break;
        }
        case 'send': {
          const pendingCallback = this.pendingCallbacks.get(message.messageId);
          if (isUndefined(pendingCallback)) {
            log(`no pending callback for message id: ${message.messageId}`, consts.logLevel.debug);
            break;
          }
          pendingCallback(JSON.parse(message.content));
          break;
        }
        case 'sendSyncNoWait' : {
          log(`Should not get here! ${JSON.stringify(message)}`, consts.logLevel.error);
          break;
        }
        case 'socket' : {
          const socket = this.sockets.get(message.socketId);
          if (isUndefined(socket)) {
            log(`no socket for message id: ${message.messageId}`, consts.logLevel.debug);
            break;
          }
          socket.onMessage(JSON.parse(message.content));
          break;
        }
      }
    });
  }

  sendSync(messageId, payload) {
    this.port.postMessage(messages.createMessage(this.uid, 'sendSync', null, {messageId, payload})); //This needs to be taken from an object pool!
    this.mutex.lock();
    this.mutex.unlockRead();
    const resultBuffer = [];
    while (true) { //We need to read from the mutex without releasing the thread execution.
      const resultObject = {};
      this.mutex.read(resultObject);
      resultBuffer.push(resultObject.charsRead);
      this.mutex.unlock();
      this.mutex.flip();
      if (resultObject.eoln) {
        break;
      }
      this.mutex.lock();
      this.mutex.unlockRead();
    }
    return JSON.parse(resultBuffer.join(''));
  }

  send(messageId, payload, callback) {
    this.pendingCallbacks.set(messageId, callback);
    this.port.postMessage(messages.createMessage(this.uid, 'send', null, {messageId, payload})); //This needs to be taken from an object pool!
  }

  sendSyncNoWait(messageId, payload) {
    this.port.postMessage(messages.createMessage(this.uid, 'sendSyncNoWait', null, {messageId, payload})); //This needs to be taken from an object pool!
  }

  //Timers

  setTimeout(callback, timerDelay) {
    const timerId = this.nextTimerId;
    this.nextTimerId++;
    let timeoutResult = null;
    const waitPromise = new Promise((resolve) => {
      timeoutResult = setTimeout(() => {
        resolve(callback());
      }, timerDelay);
    });
    this.pendingTimers.set(timerId, {promise: waitPromise, timeoutResult});
    return timerId;
  }

  setInterval(callback, timerDelay) {
    const timerId = this.nextTimerId;
    this.nextTimerId++;
    let timeoutResult = null;
    let promiseResolve = null;
    const waitPromise = new Promise((resolve) => {
      promiseResolve = resolve;
      timeoutResult = setInterval(() => {
        callback();
      }, timerDelay);
    });
    this.pendingTimers.set(timerId, {promise: waitPromise, timeoutResult, promiseResolve});
    return timerId;
  }

  clearTimer(id) {
    const timerData = this.pendingTimers.get(id);
    if (timerData !== undefined) {
      clearTimeout(timerData.timeoutResult);
      if (timerData.promiseResolve) {
        timerData.promiseResolve();
      }
    }
  }

  clearAllTimers() {
    const keys = this.pendingTimers.keys();
    for (const timerId of keys) {
      this.clearTimer(timerId);
    }
  }

  waitForTimer(id) {
    const {promise} = this.pendingTimers.get(id);
    return promise;
  }

  //WebSocket
  registerSocket(socketId, onMessageFunc) {
    this.sockets.set(socketId, {
      onMessage: onMessageFunc
    });
  }

  unregisterSocket(socketId) {
    const socketData = this.sockets.get(socketId);
    if (socketData) {
      clearSocketData(socketData);
      this.sockets.delete(socketId);
    }
  }

  newSocketBarrier(socketId, timeout) {
    const socketData = this.sockets.get(socketId);
    if (socketData) {
      socketData.barrier = new Promise((resolve, reject) => {
        socketData.barrierResolve = resolve;
        socketData.barrierReject = reject;
      });
      if (timeout !== undefined) {
        socketData.barrierTimeout = setTimeout(() => {
          if (socketData.barrierResolve) {
            socketData.barrierResolve();
          }
        }, timeout);
      }
      return socketData.barrier;
    }
  }

  breakSocketBarrier(socketId, errorMessage) {
    const socketData = this.sockets.get(socketId);
    if (socketData && socketData.barrier) {
      if (errorMessage) {
        socketData.barrierReject(errorMessage);
      } else {
        socketData.barrierResolve();
      }
    }
  }

  waitForSocketClosure(socketId, timeout) {
    const socketData = this.sockets.get(socketId);
    if (socketData) {
      socketData.closeBarrier = new Promise((resolve, reject) => {
        socketData.closeResolve = resolve;
        socketData.closeReject = reject;
      });
      if (timeout !== undefined) {
        socketData.closeTimeout = setTimeout(() => {
          socketData.closeResolve();
        }, timeout);
      }
      return socketData.closeBarrier;
    }
  }

  disconnectSocket(socketId, message, onCloseCallback) {
    const socketData = this.sockets.get(socketId);
    if (socketData) {
      if (onCloseCallback) {
        onCloseCallback(message);
      }
      if (socketData.closeBarrier) {
        socketData.closeResolve();
      }
    }
  }

  clearAllSockets() {
    const keys = this.sockets.keys();
    for (const socketId of keys) {
      this.unregisterSocket(socketId);
    }
  }

  clearResponsePendingMessages() {
    this.pendingCallbacks.forEach((callback, id) => {
      callback(new CallbackError(`canceled callback for request ${id}`));
    });
    this.pendingCallbacks.clear();
  }
}

let executor;

worker.parentPort.on('message', (message) => {
  switch (message.messageType) {
    case consts.state.init : {
      executor = new Executor(message.uid, message.port, message.mutex);
      const facade = require('./facade.js');
      facade.init(executor); //This needs to be done before the user script starts

      worker.parentPort.postMessage(messages.createMessage(message.uid, consts.state.init, consts.status.success));
      break;
    }
    case consts.state.run: {
      Promise.resolve()
        .then(() => {
          executor.script = require(message.content.userScriptTemplatePath);
          return executor.script.loadTest(message.content.args);
        })
        .then(() => {
          worker.parentPort.postMessage(messages.createMessage(message.uid, consts.state.create, consts.status.success));
        })
        .catch((err) => {
          worker.parentPort.postMessage(messages.createMessage(message.uid, consts.state.create, consts.status.failure, err));
        });
      break;
    }
    case consts.state.stage: {
      executor.script.runVuserStage(message.content);
    }
  }
});

function log(message, level) {
  worker.parentPort.postMessage({
    messageType: consts.state.log,
    content: {message, level}
  });
}

// create a proxy handler for the console object
// the handler calls the log function with a warning message when any function is called
const proxyConsoleObject = new Proxy(console, {
  get(target, property) {
    const val = target[property];
    if (typeof val === 'function') {
      return () => log(`the console.${property} function is not supported`, consts.logLevel.warning);
    } else {
      return val;
    }
  }
});

// override the console object in the execution worker
globalThis.console = proxyConsoleObject;
