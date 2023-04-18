'use strict';

const worker = require('worker_threads');
const {DualMutex} = require('./mutex.js');
const consts = require('./../../common/constants.js');
const DataHandler = require('./../../common/data_handler.js');
const messages = require('./message.js');
const net = require('net');
const messageIdRegEx = /"messageId":(-?\d+)/;
const socketIdRegEx = /"socketId":"(\d+)"/;

class Communicator {
  constructor(uid, port, mutex) {
    this.uid = uid;
    this.port = port;
    this.mutex = DualMutex.connect(mutex);
    this.mutex.lock(); //Initial state we lock the first mutex
    this.mutex.lockRead();

    this.pendinRequests = new Map();

    this.port.on('message', (message) => {
      switch (message.messageType) {
        case 'sendSync': {
          this.connection.write(Buffer.from(message.content.payload));
          this.pendinRequests.set(message.content.messageId, message);
          break;
        }
        case 'send': {
          this.connection.write(Buffer.from(message.content.payload));
          this.pendinRequests.set(message.content.messageId, message);
          break;
        }
        case 'sendSyncNoWait' : {
          this.connection.write(Buffer.from(message.content.payload));
          break;
        }
      }
    });
  }

  connect(host, port) {
    return new Promise((resolve) => {
      this.dataHandler = new DataHandler(this.handleMessage.bind(this));
      this.connection = net.createConnection({host, port}, () => {
        resolve();
      });
      this.connection.on('data', this.dataHandler.getHandler());
    });
  }

  handleMessage(message) {
    const messageId = Number(messageIdRegEx.exec(message)[1]);
    if (messageId === -1) { //It is a socket message, we need to handle it socketely
      const socketId = socketIdRegEx.exec(message)[1];
      this.port.postMessage({
        messageType: 'socket',
        socketId,
        content: message
      });
    } else {
      const pendingMessage = this.pendinRequests.get(messageId);
      pendingMessage.content = message;
      switch (pendingMessage.messageType) {
        case 'sendSync': {
          let currentWritePosition = 0;
          while (true) {
            const resultObject = {};
            this.mutex.write(message, currentWritePosition, resultObject);
            currentWritePosition += resultObject.charsWritten;
            this.mutex.lockReadOther();
            this.mutex.lockOther();
            this.mutex.unlock();
            this.mutex.flip();
            if (resultObject.eoln) {
              break;
            }
          }
          break;
        }
        case 'send': {
          this.pendinRequests.delete(messageId);
          pendingMessage.messageId = messageId;
          this.port.postMessage(pendingMessage);
          break;
        }
        case 'sendSyncNoWait': {
          log(`Should not get here with message id ${messageId}`, consts.logLevel.error);
          break;
        }
      }

      this.pendinRequests.delete(messageId);
    }
  }
}

const communicators = new Map();

worker.parentPort.on('message', (message) => {
  switch (message.messageType) {
    case consts.state.init : {
      const communicator = new Communicator(message.uid, message.port, message.mutex);
      communicators.set(message.uid, communicator);
      communicator.connect(message.runlogicHost, message.runlogicPort).then(() => {
        worker.parentPort.postMessage(messages.createMessage(message.uid, consts.state.init, consts.status.success));
      });
      break;
    }
    case consts.state.run: {
      break;
    }
  }
});

function log(message, level) {
  worker.parentPort.postMessage({
    messageType: consts.state.log,
    content: {message, level}
  });
}
