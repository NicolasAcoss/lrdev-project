'use strict';

const net = require('net');
const path = require('path');
const networkUtils = require('./common/network_utils');
const constants = require('./common/constants.js');
const logger = require('./logger');
const DataHandler = require('./common/data_handler.js');

//A connection to the run logic controller which tells the runner when to start/stop/pause vUsers
//This class is only responsible for the communication part, the actual operations are delegated to the controller
class RunLogicClient {
  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.dataHandler = new DataHandler(this.handleCommand.bind(this));
  }

  connect(options) {
    return new Promise((resolve) => {
      const self = this;
      this.connection = net.createConnection({
        host: options.address,
        port: options.controlPort
      }, function() {
        self.logMessage(`Connection to RunLogic is successfully established on: ${JSON.stringify(this.address())}`, 'debug');
        self.logMessage(`Running Node.js version: ${process.version}`, 'info');
        const statusMsg = networkUtils.createStatusMessage(constants.appLoaderMessageType, constants.state.live, '', constants.status.success);
        this.write(networkUtils.objectToMessage(statusMsg));

        resolve();
      })
        .on('error', this.socketErrHandler)
        .on('data', this.dataHandler.getHandler())
        .on('end', this.connEndHandler);
    });
  }

  logMessage(message, level) {
    if (!logger.needToLog(level)) {
      return;
    }
    const logMessage = networkUtils.createLogMessage(message, level);
    if (this.connection.writable) {
      this.connection.write(networkUtils.objectToMessage(logMessage));
    }
  }

  handleCommand(commandMessage) {
    try {
      const commandMessageObject = JSON.parse(commandMessage);
      const command = commandMessageObject.content.command;
      switch (command) {
        case 'createVUsers': {
          const options = {
            scriptDirectory: commandMessageObject.content.scriptDirectory,
            scriptName: path.basename(commandMessageObject.content.scriptDirectory),
            vusers: commandMessageObject.content.vusers,
            userArgs: commandMessageObject.content.userArgs,
            additionalFiles: commandMessageObject.content.additionalFiles
          };
          this.eventEmitter.emit('Create Vusers', options,
            (err, readyVusers) => {
              let statusMsg;
              if (err !== null) {
                statusMsg = networkUtils.createStatusMessage(constants.flowControlMessageType, constants.state.create, err.message, constants.status.failure);
              } else {
                statusMsg = networkUtils.createStatusMessage(constants.flowControlMessageType, constants.state.create, readyVusers, constants.status.success);
              }
              this.connection.write(networkUtils.objectToMessage(statusMsg));
            });
          break;
        }
        case 'run':
          this.eventEmitter.emit('Run Vuser', commandMessageObject.content.vuserId, commandMessageObject.content.stage, commandMessageObject.content.flow);
          break;
        case 'stop':
          this.eventEmitter.emit('Stop Vuser', commandMessageObject.content.vuserId);
          break;
        default:
          this.socketErrHandler(`Unrecognized command in received JSON: ${command}`);
      }
    } catch (err) {
      this.socketErrHandler(err);
    }
  }

  stop() {
    if (this.connection) {
      this.connection.end();
    }
  }

  connEndHandler() {
    logger.trace('Connection disconnected from Controller');
  }

  socketErrHandler(err) {
    logger.error(`Error in run logic connection: ${err}`);
  }
}

module.exports = RunLogicClient;
