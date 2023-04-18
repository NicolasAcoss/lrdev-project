const {_setInterval, _setTimeout, clearTimer, waitForTimer} = require('./../core_modules/timers.js');
const {isFunction, isInteger} = require('./../../utils/validator.js');
const lifecycle = require('./../user_lifecycle.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

module.exports = function(load) {
  /**
   * Allows to create timer objects that fire either after a specific delay or at multiple times after each delay has passed
   */

  function isTimerAlreadyStarted(timer) {
    if (timer._id !== -1) {
      throw new LoadError(ErrorTypes.timers, `The timer ${timer._id} has already been started.`, null, ErrorCodes.sdk_logic);
    }
  }

  function errorHandler(timer, callback) {
    return async function() {
      return Promise.resolve()
        .then(() => {
          return callback();
        })
        .catch((err) => {
          lifecycle.crashVuserWithError(load, err);
        });
    };
  }

  class Timer {
    /**
     * Creates an timer that will fire once every `delay` milliseconds.
     * @param callback the callback to call each time the timer fires
     * @param delay interval time in milliseconds
     */
    constructor(callback, delay) {
      if (!isFunction(callback)) {
        throw new LoadError(ErrorTypes.timers, 'Timer callback must be set and must be a function', null, ErrorCodes.sdk);
      }
      if (!isInteger(delay) || delay < 0) {
        throw new LoadError(ErrorTypes.timers, 'Timer delay must be set and must be a positive integer', null, ErrorCodes.sdk);
      }
      this._callback = errorHandler(this, callback);
      this._delay = delay;
      this._id = -1;
      this._openStage = '';
    }

    /**
     * stops the timer
     */
    stop() {
      if (this._id === -1) {
        throw new LoadError(ErrorTypes.timers, 'Cannot stop a timer that has not been started', null, ErrorCodes.sdk_logic);
      }
      if (this._openStage !== load.config.stage) {
        throw new LoadError(ErrorTypes.timers, `The timer ${this._id} has been started in ${this._openStage} stage and and therefore cannot be stopped in the ${load.config.stage} stage`, null, ErrorCodes.sdk_logic);
      }
      clearTimer(this._id);
      this._id = -1;
      return this;
    }

    /**
     * Starts an interval timer that will fire once every `delay` milliseconds.
     */
    startInterval() {
      isTimerAlreadyStarted(this);
      this._openStage = load.config.stage;
      this._id = _setInterval(this._callback, this._delay);
      return this;
    }

    /**
     * Starts a timeout timer that will fire once after `delay` milliseconds.
     */
    startTimeout() {
      isTimerAlreadyStarted(this);
      this._openStage = load.config.stage;
      this._id = _setTimeout(this._callback, this._delay);
      return this;
    }

    /**
     * allows to `await` the timeout or interval to fire and clear before finishing the iteration.
     * if it's not used with a timer create with setInterval or setTimeout - behaviour is undefined.
     */
    wait() {
      if (this._id === -1) {
        throw new LoadError(ErrorTypes.timers, 'Cannot wait on a timer that has not been started', null, ErrorCodes.sdk_logic);
      }
      if (this._openStage !== load.config.stage) {
        throw new LoadError(ErrorTypes.timers, `The timer ${this._id} has been started in ${this._openStage} stage and and therefore cannot be waited on in the ${load.config.stage} stage`, null, ErrorCodes.sdk_logic);
      }
      return waitForTimer(this._id);
    }
  }

  return {
    Timer: Timer
  };
};
