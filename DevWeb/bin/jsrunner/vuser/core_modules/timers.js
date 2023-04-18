'use strict';
const {isInteger} = require('./../../utils/validator.js');
const native = require('./../../bogatyr/internal/facade.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

//Definitions of functions in order to support testing
function setInterval(callback, delay) {
  return native.timers.setInterval(callback, delay);
}

function setTimeout(callback, delay) {
  return native.timers.setTimeout(callback, delay);
}

function clearTimer(id) {
  if (!isInteger(id) && id >= 0) {
    throw new LoadError(ErrorTypes.timers, `clearTimer requires to pass id (unsigned integer) but it received [${id}]`, null, ErrorCodes.script);
  }
  return native.timers.clearTimer(id);
}

function waitForTimer(id) {
  if (!isInteger(id) && id >= 0) {
    throw new LoadError(ErrorTypes.timers, 'Bad argument passed to waitForTimer: Please pass id (unsigned integer)', null, ErrorCodes.script);
  }
  return native.timers.waitForTimer(id);
}

module.exports = {
  _setTimeout: setTimeout,
  _setInterval: setInterval,
  clearTimer,
  waitForTimer
};
