const message = require('./../message.js');
const {isString, isEmpty, isNil} = require('./../../utils/validator.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

module.exports = function(load) {
  const {internalLog, LogLevel} = require('./../utils/log_utils.js')(load);
  /**
   * The rendezvous function creates a rendezvous point in a DevWeb script.
   * When this statement executed the Vuser program stops and waits for permission to continue.
   * This function can only be used in an action section, and not in initialize or finalize.
   * This capability available under LRC\LRP execution only.
   * @param name - Rendezvous name as defined (name must be w/o spaces)
   */
  function rendezvous(name) {
    if (isNil(name)) {
      throw new LoadError(ErrorTypes.rendezvous, `You must provide a rendezvous name`, null, ErrorCodes.sdk);
    }
    if (!isString(name)) {
      throw new LoadError(ErrorTypes.rendezvous, `Rendezvous name must be string, but ${name} was given`, null, ErrorCodes.sdk);
    }
    if (isEmpty(name)) {
      throw new LoadError(ErrorTypes.rendezvous, `You must provide a non empty rendezvous name`, null, ErrorCodes.sdk);
    }
    const spacePosition = name.search(/\s/g);
    if (spacePosition !== -1) {
      throw new LoadError(ErrorTypes.rendezvous, `Rendezvous name must not contains spaces (position: ${spacePosition})`, null, ErrorCodes.sdk);
    }
    if (load.config.stage === 'action') {
      message.sendMessageSync('Rendezvous.Notify', load.config.user.userId, {
        name: name
      });
    } else {
      internalLog(`Rendezvous point ${name} must be in action`, LogLevel.warning);
    }
  }
  return {
    rendezvous: rendezvous
  };
};
