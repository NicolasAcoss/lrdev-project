'use strict';
const constants = require('./constants');
//various util functions to help you send messages
module.exports = {
  createMessage: function(counter, messageType, content) {
    return {
      id: constants.JSRunner,
      counter,
      originator: constants.JSRunner,
      messageType,
      content
    };
  },
  //Given the parameters creates a properly formatted object that can be sent as JSON to the Orchestrator/RunLogic
  createStatusMessage: function(messageType, state, message, status) {
    const content = {
      state: state || '',
      status: status,
      message: message
    };
    return this.createMessage(0, messageType, content);
  },
  //Creates an engine log message
  createLogMessage: function(message, logLevel) {
    const content = {
      logLevel,
      message: message
    };
    return this.createMessage(0, 'Engine.Log', content);
  },
  //Converts an object into a string that can be sent to the Orchestrator/RunLogic
  objectToMessage: function(object) {
    return `${JSON.stringify(object)}\n`;
  }
};
