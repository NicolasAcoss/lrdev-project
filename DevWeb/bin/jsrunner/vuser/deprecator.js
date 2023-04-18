'use strict';

module.exports = function(load) {
  const {internalLog, LogLevel} = require('./utils/log_utils.js')(load);
  return {
    deprecateClass(oldClassName, newClassName) {
      return function() {
        if (newClassName) {
          internalLog(`Deprecation: The ${oldClassName} class was deprecated, please use ${newClassName} instead`, LogLevel.warning);
        } else {
          internalLog(`Deprecation: The ${oldClassName} class was deprecated`, LogLevel.warning);
        }
      };
    },

    deprecateProperty(objectName, oldPropertyName, newPropertyName) {
      if (newPropertyName) {
        internalLog(`Deprecation: The property ${oldPropertyName} of the object ${objectName} was deprecated, please use ${newPropertyName} instead`, LogLevel.warning);
      } else {
        internalLog(`Deprecation: The property ${oldPropertyName} of the object ${objectName} was deprecated`, LogLevel.warning);
      }
    }
  };
};