const StackedError = require('./stacked_error.js');
const native = require('./../bogatyr/internal/facade.js');
const message = require('./message.js');
const constants = require('./../common/constants.js');
const UserAbortError = require('./user_abort_error.js');
const CallbackError = require('./callback_error.js');
const {LoadError} = require('./load_error.js');
const ErrorCodes = require('./error_codes.js');
const {isUndefined} = require('./../utils/validator.js');

module.exports = {
  crashVuser(load, error, location) {
    const {internalLog, LogLevel} = require('./utils/log_utils.js')(load);
    const extraLocationData = location ? `thrown  ${location}` : '';
    const errMessage = `Vuser ${load.config.stage} was stopped after receiving runtime error '${error.message}'${extraLocationData}`;
    const errStack = `Error stack: '${error.stack}'`;
    internalLog(new StackedError(errMessage, error), LogLevel.error, ErrorCodes.crash);
    internalLog(errStack, LogLevel.debug);
    message.sendMessageSyncNoResponse('VUser.Crash', load.config.user.userId, {
      stage: load.config.stage,
      result: constants.status.failure,
      code: ErrorCodes.crash
    });
  },
  crashVuserWithError(load, err) {
    const {internalLog, LogLevel} = require('./utils/log_utils.js')(load);
    if (err instanceof UserAbortError) {
      if (err.message !== '') {
        internalLog(err.message, LogLevel.warning);
      }
      internalLog('Calling load.exit from a callback is not supported', LogLevel.error, ErrorCodes.sdk_logic);
      return;
    }
    native.clear();
    if (global.gc) {
      global.gc();
    }
    let location = 'at unknown';
    if (!isUndefined(err.stack)) {
      const splitStack = err.stack.split('\n');
      location = splitStack[1].trim();
    }
    this.crashVuser(load, err, location);
  },
  handleKnownError(load, error, stage) {
    const {internalLog, LogLevel} = require('./utils/log_utils.js')(load);
    if (error instanceof UserAbortError) {
      if (error.exitType === load.ExitType.abort) {
        return;
      }
      internalLog(error.message, LogLevel.warning);
      return;
    }
    if (error instanceof CallbackError) {
      internalLog(error.message, LogLevel.trace);
      return;
    }
    if (error instanceof LoadError) {
      internalLog(new StackedError(`Vuser ${stage} was stopped after receiving ${error.type} error: '${error.message}'.`, error), LogLevel.error, error.code);
      return;
    }
    // In case of internal engine error
    return Promise.reject(error);
  },
  finishCycle(result, stage) {
    native.clear();
    message.sendMessageSyncNoResponse('VUser.CycleEnd', load.config.user.userId, {
      stage,
      result
    });
  }
};
