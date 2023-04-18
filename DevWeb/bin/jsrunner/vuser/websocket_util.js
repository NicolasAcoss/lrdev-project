const {unregisterSocket, disconnectSocket, breakSocketBarrier} = require('./core_modules/net.js');

const {isFunction} = require('./../utils/validator.js');
const {LoadError} = require('./load_error.js');
const UserAbortError = require('./user_abort_error.js');
const lifecycle = require('./user_lifecycle.js');

const readyStates = ['INIT', 'OPENING', 'OPEN', 'ERROR', 'CLOSING', 'CLOSED'];
const webSocketStates = {};
readyStates.forEach((_readyState, i) => {
  webSocketStates[readyStates[i]] = i;
});

/**
 * handles the closing of the connection -
 * initiated by the server, or as response to request to close it from the runner
 * @param load
 * @param ws the websocket instance
 * @param message the closing message
 */
function closeHandler(load, ws, message) {
  breakSocketBarrier(ws.id);
  disconnectSocket(ws.id, message, () => {
    if (isFunction(ws.onClose)) {
      try {
        ws.onClose(message);
      } catch (err) {
        lifecycle.crashVuserWithError(load, err);
      }
    }
  });
  unregisterSocket(ws.id);
}

/**
 * Handles the errors - deals with them depending on the connection state
 * @param load
 * @param ws
 * @param error
 */
function errorHandler(load, ws, error) {
  // ws.logger(`Entered error handler due to - ${error}`, `error`);
  let errorMsg = ``;
  if (error instanceof LoadError) {
    errorMsg = `${error.type} error: ${error.content.message}`;
  } else {
    errorMsg = `${error.type} error: ${error.message}`;
  }
  if ([webSocketStates.OPEN, webSocketStates.ERROR, webSocketStates.CLOSING].includes(ws._readyState)) {
    ws._readyState = webSocketStates.CLOSING;
    breakSocketBarrier(ws.id, error);
    ws._readyState = webSocketStates.CLOSED; //TODO: maybe move this to callback
    disconnectSocket(ws.id, error, () => {
      if (isFunction(ws.onError)) {
        try {
          ws.onError(errorMsg);
        } catch (err) {
          lifecycle.crashVuserWithError(load, err);
        }
      }
      if (isFunction(ws.onClose)) {
        try {
          ws.onClose(error);
        } catch (err) {
          lifecycle.crashVuserWithError(load, err);
        }
      }
    });
    unregisterSocket(ws.id);
  } else {
    ws._readyState = webSocketStates.CLOSED; //TODO: maybe move this to callback
    if (isFunction(ws.onError)) {
      try {
        ws.onError(errorMsg);
      } catch (err) {
        lifecycle.crashVuserWithError(load, err);
      }
    }
  }
}

/**
 * Handles incoming messages from the server
 * a message can be of three main types: regular message sent from the server, error message and error message
 * which notifies of connection closing.
 * @param load
 * @param ws
 * @param incomingMessage
 */
function incomingWebSocketMessageHandler(load, ws, incomingMessage) {
  // ws.logger(`Socket [${ws.id}] received ${JSON.stringify(incomingMessage)}}`, 'trace');
  if (ws._readyState === webSocketStates.OPEN || ws._readyState === webSocketStates.CLOSING) {
    switch (incomingMessage.messageType) {
      case 'WebSocket.Message': {
        try {
          if (incomingMessage.content.isBinaryData) {
            incomingMessage.content.data = Buffer.from(incomingMessage.content.data, 'base64');
          }
          ws.onMessage(incomingMessage.content);
        } catch (err) {
          lifecycle.crashVuserWithError(load, err);
        }
        break;
      }
      case 'Error.WebSocket': {
        const messageContent = new LoadError(incomingMessage.messageType.replace('Error.', ''), 'WebSocket connection error', incomingMessage.content, incomingMessage.errorCode);
        ws._readyState = webSocketStates.CLOSING;
        errorHandler(load, ws, messageContent);
        break;
      }
      case 'WebSocket.ServerSocketClose': {
        // we received a server socket close -> socket is open, or waiting to be closed after requesting closure
        // therefore this is an error unless we are waiting for closing.
        // but we can't check this so we resolve everything and they should decide themselves
        // during regular run -> we will get an error when we try to use a closed socket
        // during 'wait for data' -> it should error
        // during 'wait for close' -> We change status to closing if server. close hasn't been called, shouldn't error
        // ws.logger(`Socket [${ws.id}] in state ${ws._readyState}, received to close socket from server`, 'info');
        ws._readyState = webSocketStates.CLOSING;
        closeHandler(load, ws, incomingMessage.content);
        ws._readyState = webSocketStates.CLOSED;
        break;
      }
      default: {
        ws._readyState = webSocketStates.CLOSING;
        errorHandler(load, ws, new UserAbortError('abort', {content: {message: `WebSocket unknown message:  ${JSON.stringify(incomingMessage.content)}`}}));
        ws._readyState = webSocketStates.CLOSED;
        break;
      }
    }
  } else {
    ws.logger(`Socket already closed, dropping received message from queue  - [${JSON.stringify(incomingMessage)}]`, 'error');
  }
}

module.exports = {
  incomingWebSocketMessageHandler,
  errorHandler,
  closeHandler,
  webSocketStates
};
