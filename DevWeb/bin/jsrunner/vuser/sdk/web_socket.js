'use strict';
const {
  newSocketBarrier,
  breakSocketBarrier,
  registerSocket,
  waitForSocketClosure,
  unregisterSocket
} = require('./../core_modules/net.js');
const {isFunction, isString, isUndefined, isObject} = require('./../../utils/validator.js');
const {incomingWebSocketMessageHandler, errorHandler, webSocketStates} = require('./../websocket_util.js');
const message = require('./../message.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');
const lifecycle = require('./../user_lifecycle.js');

module.exports = function(load) {
  const {internalLog, LogLevel} = require('./../utils/log_utils.js')(load);
  const deprecator = require('./../deprecator.js')(load);
  const DEFAULT_WAIT_FOR_DATA_TIMEOUT = 120000; //120 seconds is the default timeout
  const DEFAULT_WAIT_FOR_CLOSE_TIMEOUT = 120000; //120 seconds is the default timeout
  const DISCONNECT_TIMEOUT_MESSAGE_CODE = 1006;

  let websocketIdCounter = 0;

  /**
   * Generates new websocket id
   * @returns {string} new websocket id
   */
  function createWebSocketId() {
    return (websocketIdCounter++).toString();
  }

  /**
   * Tests if the given received response is an error description and calls the error handler if it does
   * @param ws current websocket instance
   * @param response
   */
  function isResponseLoadError(ws, response) {
    return response instanceof LoadError;
  }

  function isCurrentStageInit() {
    return load.config.stage === 'initialize';
  }

  class WebSocket {
    constructor(options) {
      if (!isString(options.url)) {
        throw new LoadError(ErrorTypes.WebSocket, `WebSocket options must have a "url" property but ${options.url} was passed`, null, ErrorCodes.sdk);
      }
      if (!isFunction(options.onMessage)) {
        throw new LoadError(ErrorTypes.WebSocket, `WebSocket options.onMessage must be a function but ${options.onMessage} was sent`, null, ErrorCodes.sdk);
      }
      if (!isUndefined(options.onError) && !isFunction(options.onError)) {
        throw new LoadError(ErrorTypes.WebSocket, `WebSocket options.onError must be a function but ${options.onError} was sent`, null, ErrorCodes.sdk);
      }
      if (!isUndefined(options.onOpen) && !isFunction(options.onOpen)) {
        throw new LoadError(ErrorTypes.WebSocket, `WebSocket options.onOpen must be a function but ${options.onOpen} was sent`, null, ErrorCodes.sdk);
      }
      if (!isUndefined(options.onClose) && !isFunction(options.onClose)) {
        throw new LoadError(ErrorTypes.WebSocket, `WebSocket options.onClose must be a function but ${options.onClose} was sent`, null, ErrorCodes.sdk);
      }

      //Backward compatibility -------------------------------------------
      const originalOnMessage = options.onMessage;
      options.onMessage = function(socketMessage) {
        Object.defineProperty(socketMessage, 'isBinary', {
          enumerable: true,
          get: function() {
            deprecator.deprecateProperty(socketMessage, 'isBinary', 'isBinaryData');
            return socketMessage.isBinaryData;
          }
        });
        originalOnMessage(socketMessage);
      };
      //--------------------------------------------------------------------

      Object.assign(this, options);
      this._readyState = webSocketStates.INIT;
      this._disconnectionPromise = null;
      this._barrierPromise = null;
      this._isOpenedInInitStage = false;
      this.logger = internalLog;
    }

    /**
     * starts the connection process of the websocket to the server.
     * @returns {WebSocket}
     */
    open() {
      this.id = createWebSocketId();
      if (isCurrentStageInit()) {
        this._isOpenedInInitStage = true;
      }
      this._readyState = webSocketStates.OPENING;
      const response = message.sendMessageSync('WebSocket.Open', load.config.user.userId, {
        id: this.id,
        url: this.url,
        headers: this.headers || {}
      });
      if (isResponseLoadError(this, response)) {
        errorHandler(load, this, response);
        response.message = response.content.message;
        throw response;
      }
      const webSocketMessageHandlerCurry = (...args) => incomingWebSocketMessageHandler(load, this, ...args);
      registerSocket(this.id, webSocketMessageHandlerCurry);
      if (isFunction(this.onOpen)) {
        try {
          this.onOpen(response);
        } catch (err) {
          lifecycle.crashVuserWithError(load, err);
        }
      }
      this._readyState = webSocketStates.OPEN;
      return this;
    }

    /**
     * This starts the closing handshake with the websocket server
     * once the closure has been done - a finalization message will be sent from the runLogic
     */
    close(code, reason, force) {
      //internalLog(`--- close called _readyState: ${this._readyState}, `, LogLevel.trace);
      if (this._readyState === webSocketStates.INIT) {
        const exitMessage = `Trying to close websocket [${this.id}] that hasn't been opened yet`;
        throw new LoadError(ErrorTypes.WebSocket, exitMessage, {message: exitMessage}, ErrorCodes.sdk_logic);
      }
      if (this._readyState === webSocketStates.OPEN || this._readyState === webSocketStates.OPENING) {
        this._readyState = webSocketStates.CLOSING;
        const response = message.sendMessageSync('WebSocket.Close', load.config.user.userId, {
          ID: this.id,
          Code: code || 1000,
          Reason: reason || 'normal',
          force: force || false
        });
        if (isResponseLoadError(this, response)) {
          errorHandler(load, this, response);
          throw response;
        }
        //TODO: verify cleaning even in case the connection wasn't closed.
      }
    }

    /**
     * sends message to the websocket server
     */
    send(data) {
      let options = {
        data,
        dataPath: '',
        isBinary: arguments[1] || false //Backward compatibility for the signature send(data, isBinary)
      };

      if (!Buffer.isBuffer(data) && isObject(data)) { //send(options) overload
        options = data;
      }

      const dataStr = options.data ? options.data : options.dataPath;

      if (!dataStr) {
        throw new LoadError(ErrorTypes.WebSocket, `WebSocket send must have data or dataPath defined`, null, ErrorCodes.sdk);
      }

      if (this._readyState < webSocketStates.OPEN) {
        const exitMessage = `WebSocket [Id: ${this.id}] has not been open, message: [${dataStr}] will not be sent`;
        throw new LoadError(ErrorTypes.WebSocket, exitMessage, {message: exitMessage}, ErrorCodes.sdk_logic);
      }
      if (this._readyState > webSocketStates.OPEN) {
        const exitMessage = `WebSocket [Id: ${this.id}] already closed, message: [${dataStr}] will not be sent`;
        throw new LoadError(ErrorTypes.WebSocket, exitMessage, {message: exitMessage}, ErrorCodes.sdk_logic);
      }

      let isBinaryData = false;
      if (Buffer.isBuffer(options.data)) {
        options.data = options.data.toString('base64');
        options.isBinary = true;
        isBinaryData = true;
      }

      message.sendMessageSyncNoResponse('WebSocket.Send', load.config.user.userId, {
        id: this.id,
        isBinaryData,
        isBinary: options.isBinary,
        data: options.data,
        dataPath: options.dataPath
      });
      return this;
    }

    /**
     * Create new websocket barrier to sync for messages with timeout.
     * @param requestedTimeout in milliseconds (Default: 120000 milliseconds) use -1 for unlimited.
     * @returns {PromiseLike<T | never> | Promise<T | never>}
     */
    waitForData(requestedTimeout) {
      //this.logger(`--- waitForData _readyState: ${this._readyState}, requestedTimeout: ${requestedTimeout}`, load.LogLevel.trace);
      if (this._readyState < webSocketStates.OPEN) {
        const errMessage = `WebSocket [Id: ${this.id}] has not been open yet, socket.open() need to be called before calling waitForData.`;
        throw new LoadError(ErrorTypes.WebSocket, errMessage, {message: errMessage}, ErrorCodes.sdk_logic);
      }
      if (this._readyState > webSocketStates.OPEN) {
        const exitMessage = `WebSocket [Id: ${this.id}] has been closed, waitForData will not be done.`;
        return Promise.reject(new LoadError(ErrorTypes.WebSocket, exitMessage, {message: exitMessage}, ErrorCodes.sdk_logic));
      }
      let timeout = requestedTimeout;
      if (requestedTimeout === undefined) {
        this.logger(`WebSocket [Id: ${this.id}] waitForData is using default timeout (${DEFAULT_WAIT_FOR_DATA_TIMEOUT} milliseconds).`, LogLevel.debug);
        timeout = DEFAULT_WAIT_FOR_DATA_TIMEOUT;
      }
      this._barrierPromise = newSocketBarrier(this.id, timeout).then(() => {
        if (this._readyState !== webSocketStates.OPEN) {
          const errMessage = `WebSocket [Id: ${this.id}] has been closed during waitForData`;
          throw new LoadError(ErrorTypes.WebSocket, errMessage, {message: errMessage}, ErrorCodes.sdk_logic);
        }
        this.logger(`WebSocket [Id: ${this.id}] waitForData barrier released.`, LogLevel.trace);
      }).catch((error) => {
        if (isUndefined(error)) {
          this.logger(`WebSocket [Id: ${this.id}] waitForData timeout expired.`, LogLevel.warning);
        } else {
          this.logger(new Error(`Rejecting WebSocket wait for data barrier due to error: ${error.message}`), LogLevel.error);
          throw error;
        }
      });
      return this._barrierPromise;
    }

    /**
     * Releases the barrier of this websocket
     */
    continue() {
      if (this._readyState === webSocketStates.OPEN) {
        breakSocketBarrier(this.id);
      } else if (this._readyState === webSocketStates.CLOSED) {
        errorHandler(load, this, new LoadError(ErrorTypes.WebSocket, `vUser called continue on closed WebSocket ${this.id}`, null, ErrorCodes.sdk_logic));
      }
      // If we got continue after socket has been closed or during closing -> we can ignore the continue.
    }

    /**
     * returns the promise of the websocket closing.
     * Released upon requested or abnormal closing
     * @param requestedTimeout in milliseconds defines the timeout - optional
     * @returns Promise<T | never> promise.
     */
    waitForClose(requestedTimeout) {
      //internalLog(`--- waitForClose _readyState: ${this._readyState}`, LogLevel.trace);
      if (this._readyState < webSocketStates.OPEN) {
        const errMessage = `WebSocket [Id: ${this.id}] has not been open yet, socket.open() need to be called before calling waitForClose.`;
        throw new LoadError(ErrorTypes.WebSocket, errMessage, {message: errMessage}, ErrorCodes.sdk_logic);
      }
      let timeout = requestedTimeout;
      if (requestedTimeout === undefined) {
        this.logger(`WebSocket [Id: ${this.id}] waitForClose is using default timeout (${DEFAULT_WAIT_FOR_CLOSE_TIMEOUT} milliseconds).`, LogLevel.debug);
        timeout = DEFAULT_WAIT_FOR_CLOSE_TIMEOUT;
      }
      this._disconnectionPromise = waitForSocketClosure(this.id, timeout).then(() => {
        internalLog(`WebSocket [Id: ${this.id}] waitForClose barrier released.`, LogLevel.trace);
        if (this._readyState < webSocketStates.CLOSING) {
          internalLog(`WebSocket [Id: ${this.id}] waitForClose timeout expired.`, LogLevel.warning);
          const disconnectMessage = `waitForClose timeout expired`;
          this.close(DISCONNECT_TIMEOUT_MESSAGE_CODE, disconnectMessage, true);
          this._readyState = webSocketStates.CLOSED;
          const closeMessage = {
            id: this.id,
            isClosedByClient: true,
            code: DISCONNECT_TIMEOUT_MESSAGE_CODE,
            reason: disconnectMessage
          };
          if (isFunction(this.onClose)) {
            try {
              this.onClose(closeMessage);
            } catch (err) {
              lifecycle.crashVuserWithError(load, err);
            }
          }
          unregisterSocket(this.id);
        }
      }).catch((error) => {
        internalLog(new Error(`Rejecting WebSocket [Id: ${this.id}] waitForClose barrier due to error: ${JSON.stringify(error)}`), LogLevel.error, ErrorCodes.socket);
        const errorMsg = `${error.type} error: ${error.message}`;
        if (isFunction(this.onError)) {
          try {
            this.onError(errorMsg);
          } catch (err) {
            lifecycle.crashVuserWithError(load, err);
          }
        }
        if (isFunction(this.onClose)) {
          try {
            this.onClose(error);
          } catch (err) {
            lifecycle.crashVuserWithError(load, err);
          }
        }
        const err = Error(error.message);
        err.stack = '';
        unregisterSocket(this.id);
        throw err;
      });
      return this._disconnectionPromise;
    }

    _getConnectionStatus() {
      return this._readyState;
    }
  }

  return {
    WebSocket: WebSocket
  };
};
