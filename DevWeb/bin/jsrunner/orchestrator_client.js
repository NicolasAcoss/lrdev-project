'use strict';

const logger = require('./logger');
const net = require('net');
const networkUtils = require('./common/network_utils');
const DataHandler = require('./common/data_handler');
const constants = require('./common/constants.js');

//A connection to the Orchestrator, responsible of stopping/starting the entire JS Runner component.
//This connection only handles the messages received on the communication port from the controller and
//the operations themselves are delegated to the controller
class OrchestratorClient {
  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.dataHandler = new DataHandler(this.handleCommand.bind(this));
  }

  connect(options) {
    this.connection = net.createConnection(options, this.handleConnection);
    this.connection.on('error', this.socketErrHandler);
    this.connection.on('data', this.dataHandler.getHandler());
    this.connection.on('end', this.connEndHandler);
  }

  handleConnection() {
    logger.trace(`Connection to Orchestrator is successfully established on: ${JSON.stringify(this.address())}`);
    const statusMsg = networkUtils.createStatusMessage(constants.appLoaderMessageType, constants.state.live, '', constants.status.success);
    this.write(networkUtils.objectToMessage(statusMsg));
  }

  handleCommand(commandMessage) {
    try {
      const commandMessageObject = JSON.parse(commandMessage);
      const command = commandMessageObject.content.command;
      switch (command) {
        case 'init':
          this.eventEmitter.emit('Init JsRunner', commandMessageObject.content);
          break;
        case 'validate':
          this.eventEmitter.emit('Validate', commandMessageObject.content);
          break;
        case 'close':
          this.eventEmitter.emit('Close Runner');
          break;
        case 'stop':
          this.eventEmitter.emit('Stop Runner');
          break;
        default:
          this.socketErrHandler(`Unrecognized command in received JSON: ${command}`);
      }
    } catch (err) {
      this.socketErrHandler(err);
    }
  }

  close() {
    const statusMsg = networkUtils.createStatusMessage(constants.appLoaderMessageType, constants.state.close, '', constants.status.success);
    this.connection.write(networkUtils.objectToMessage(statusMsg));
  }

  stop() {
    const statusMsg = networkUtils.createStatusMessage(constants.appLoaderMessageType, constants.state.stop, '', constants.status.success);
    this.connection.write(networkUtils.objectToMessage(statusMsg), () => {
      this.connection.end();
    });
  }

  notifyInitializationStatus(status) {
    const statusMsg = networkUtils.createStatusMessage(constants.appLoaderMessageType, constants.state.init, '', status);
    this.connection.write(networkUtils.objectToMessage(statusMsg));
  }

  notifyValidationStatus(status, message) {
    const statusMsg = networkUtils.createStatusMessage(constants.appLoaderMessageType, constants.state.validate, message, status);
    this.connection.write(networkUtils.objectToMessage(statusMsg));
  }

  connEndHandler() {
    logger.trace('Connection disconnected from Orchestrator');
  }

  socketErrHandler(err) {
    if (err.code === 'ECONNRESET') {
      logger.error(`Error in controller orchestrator Connection: ${err}`);
      process.exit(5);
    }
    logger.error(`Error in controller orchestrator Connection: ${err}`);
  }
}

module.exports = OrchestratorClient;
