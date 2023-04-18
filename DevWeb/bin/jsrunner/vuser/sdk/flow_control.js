'use strict';
const {isString, isFunction, isUndefined} = require('./../../utils/validator.js');
const flowRegistry = require('./../engine/flow_registry.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

function validate(type, name, callback) {
  if (!isString(name) || !isFunction(callback)) {
    if (!isFunction(name) || !isUndefined(callback)) {
      throw new LoadError(ErrorTypes.flow, `${type} must be called with a callback function - ${type}('${type} name', function(){}) or ${type}(function(){})`, null, ErrorCodes.sdk);
    }
  }
}

module.exports = function() {
  return {
    initialize(name, callback) {
      validate('initialize', name, callback);
      flowRegistry.addInitializer(name, callback);
    },
    finalize(name, callback) {
      validate('finalize', name, callback);
      flowRegistry.addFinalizer(name, callback);
    },
    action(name, callback) {
      validate('action', name, callback);
      flowRegistry.addAction(name, callback);
    }
  };
};
