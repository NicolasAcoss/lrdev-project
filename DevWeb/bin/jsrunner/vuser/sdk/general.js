'use strict';

const {isString, isEmpty, isUndefined, isNumber, isNil, isArray, isObject} = require('./../../utils/validator.js');
const messageUtils = require('./../message.js');
const UserAbortError = require('./../user_abort_error.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

const encryptionPrefix = '$$tw_decrypt$$';
const encryptionSuffix = '$$\\tw_decrypt$$';

const maskingPrefix = '$$tw_unmask$$';
const maskingSuffix = '$$\\tw_unmask$$';

const base64RegEx = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const ExitType = {
  iteration: 'iteration',
  stop: 'stop',
  abort: 'abort'
};

module.exports = function(load) {
  const {internalLog, LogLevel} = require('./../utils/log_utils.js')(load);
  let encryptionOn = false;

  function encryptionHelper(expression, prefix, suffix) {
    if (!isString(expression) || isEmpty(expression)) {
      throw new LoadError(ErrorTypes.utils, `expression must be a string but ${expression} was given`, null, ErrorCodes.sdk);
    }
    if (!base64RegEx.test(expression)) {
      throw new LoadError(ErrorTypes.utils, `expression must be a valid base64 string but ${expression} was given`, null, ErrorCodes.sdk);
    }
    if (!encryptionOn) {
      messageUtils.sendMessageSyncNoResponse('Encryption.On', load.config.user.userId, {});
      encryptionOn = true;
    }
    return `${prefix}${expression}${suffix}`;
  }

  const result = {
    params: undefined,
    config: {},
    global: {},
    LogLevel,
    log: function(message, level) {
      internalLog(message, level, ErrorCodes.custom);
    },
    sleep: function(time) {
      if (!isNumber(time) || time <= 0) {
        internalLog(new Error(`sleep must take a positive number of seconds but ${time} was given`), LogLevel.error, ErrorCodes.sdk);
        return;
      }
      messageUtils.sendMessageSync('vUser.ThinkTime', load.config.user.userId, {
        time
      });
    },
    ExitType: ExitType,
    exit: function(exitType, message) {
      if (isUndefined(exitType)) {
        exitType = ExitType.iteration;
      }
      if (!isString(exitType) || isNil(ExitType[exitType])) {
        throw new LoadError(ErrorTypes.utils, `exit type must be one of ${Object.values(ExitType)} but ${exitType} was sent`, null, ErrorCodes.sdk);
      }
      messageUtils.sendMessageSync('VUser.Abort', load.config.user.userId, {
        exitType: exitType,
        message
      });

      throw new UserAbortError(exitType, message);
    },
    unmask: function(expression) {
      return encryptionHelper(expression, maskingPrefix, maskingSuffix);
    },
    decrypt: function(expression) {
      return encryptionHelper(expression, encryptionPrefix, encryptionSuffix);
    },
    exec: function(command, args) {
      let options;
      if (isString(command) && !isEmpty(command)) {
        options = {
          command
        };
        if (isArray(args)) {
          options.args = args;
        }
      }

      if (isObject(command)) {
        if (!isString(command.command) || isEmpty(command.command)) {
          throw new LoadError(ErrorTypes.utils, `options must contain a non empty command property but ${command.command} was provided`, null, ErrorCodes.sdk);
        }
        options = command;
      }

      if (isUndefined(options)) {
        throw new LoadError(ErrorTypes.utils, `exec can take a string command or a configuration object but ${command} was sent`, null, ErrorCodes.sdk);
      }

      if (options.isAsync === true) {
        return messageUtils.sendMessage('Exec.Command', load.config.user.userId, options)
          .then((response) => {
            if (response instanceof LoadError) {
              throw new LoadError(ErrorTypes.utils, response.content.message, response.content, response.code);
            }
            return response;
          });
      } else {
        const response = messageUtils.sendMessageSync('Exec.Command', load.config.user.userId, options);
        if (response instanceof LoadError) {
          throw new LoadError(ErrorTypes.utils, response.content.message, response.content, response.code);
        }
        return response;
      }
    }
  };

  result.thinkTime = result.sleep; //alias for think time in case we confuse users who use the SDK for the first time
  return result;
};
