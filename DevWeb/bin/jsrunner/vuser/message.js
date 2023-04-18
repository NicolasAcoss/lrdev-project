'use strict';

const {sendSync, send, sendSyncNoWait} = require('./core_modules/net.js');
const {LoadError} = require('./load_error.js');
const UserAbortError = require('./user_abort_error.js');
const CallbackError = require('./callback_error.js');
const utils = require('./utils.js');
const {startsWith} = require('./../utils/objects.js');

function replacer(key, value) {
  if (value === undefined) {
    return undefined;
  }
  return value;
}

let messageCount = 0;

module.exports = {
  sendMessageRaw(target, uid, content, isSync, isResponseRequired, source) {
    const result = {
      id: uid,
      messageId: messageCount++,
      originator: 3,
      messageType: target,
      source: source || utils.getDebugErrorPosition(), //TODO: optimize this
      content
    };
    const message = `${JSON.stringify(result, replacer)}\n`;
    if (isSync) {
      if (isResponseRequired) {
        return sendSync(result.messageId, message);
      } else {
        sendSyncNoWait(result.messageId, message);
      }
    } else {
      return new Promise((resolve, reject) => {
        send(result.messageId, message, (response) => {
          if (response instanceof CallbackError) {
            reject(response);
          } else {
            resolve(response);
          }
        });
      });
    }
  },
  sendMessageSync(target, uid, content) {
    return this.receiveMessage(this.sendMessageRaw(target, uid, content, true, true));
  },
  sendMessage(target, uid, content) {
    return this.sendMessageRaw(target, uid, content, false, true).then((message) => {
      return this.receiveMessage(message);
    });
  },
  sendMessageSyncNoResponse(target, uid, content, source) {
    this.sendMessageRaw(target, uid, content, true, false, source);
  },
  receiveMessage(message) {
    if (startsWith(message.messageType, 'FatalError.')) {
      throw new UserAbortError('abort', message.content);
    }

    if (startsWith(message.messageType, 'Error.')) {
      const errType = message.messageType.replace('Error.', '');
      let errMessage = `${message.content.content}`;
      if (!errMessage) {
        errMessage = `${message.content}`;
      }
      let content = message.content.content;
      if (!content) {
        content = message.content;
      }
      return new LoadError(errType, errMessage, content, message.content.errorCode);
    }
    return message.content;
  }
};
