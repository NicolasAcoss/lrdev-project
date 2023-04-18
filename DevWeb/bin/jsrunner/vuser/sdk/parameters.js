'use strict';

const message = require('./../message.js');

// const optionsSymbol = Symbol('options');

module.exports = function(load) {
  function parameterGetter() {
    //TODO: Optimize for nextValue options (e.g. once)
    return message.sendMessageSync('Parameter.Value.Request', load.config.user.userId, {
      name: this.name,
      iteration: load.config.runtime.iteration
    });
  }

  function initializeParams(userId) {
    const params = {};
    const messageData = message.sendMessageSync('Parameters.Request', userId, {});
    messageData.forEach((parameter) => {
      Object.defineProperty(params, parameter.name, {
        enumerable: true,
        get: parameterGetter.bind(parameter)
      });
    });
    return params;
  }

  return {
    initializeParams
  };
};