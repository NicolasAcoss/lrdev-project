'use strict';
const messageUtils = require('./../message.js');
const utils = require('./../utils.js');
const {isUndefined, isString} = require('./../../utils/validator.js');

const LogLevel = {
  error: 'error',
  warning: 'warning',
  info: 'info',
  debug: 'debug',
  trace: 'trace'
};

module.exports = function(load) {
  function internalLog(message, level, code) {
    if (isUndefined(level)) {
      level = LogLevel.info;
    }
    if (level !== LogLevel.error) {
      code = 0;
    }
    let source;
    if (message instanceof Error) {
      source = utils.getErrorPosition(message);
      message = `${message.message}`;
    } else if (!isString(message)) {
      message = JSON.stringify(message);
    }
    messageUtils.sendMessageSyncNoResponse('vUser.Log', load.config.user.userId, {
      message,
      level,
      code
    }, source);
  }
  return {
    internalLog,
    LogLevel
  };
};
