'use strict';

const EventEmitter = require('events').EventEmitter;
const JSRunner = require('./jsRunner.js');
const logger = require('./logger.js');
const OrchestratorClient = require('./orchestrator_client');
const RunLogicClient = require('./run_logic_client');
const constants = require('./common/constants.js');
const path = require('path');

//The controller is responsible for performing the actual actions on the vUsers and JS Runner
//It holds the connections to both the Orchestrator and the RunLogic and  waits for appropriate
//events to be fired on the event emitter.
class Controller {
  constructor(options) {
    this.options = options;
    this.eventEmitter = new EventEmitter();
    this.orchestratorClient = new OrchestratorClient(this.eventEmitter);
    this.runLogicClient = new RunLogicClient(this.eventEmitter);
    this.registerEventHandlers();
    if (global.gc) {
      logger.trace('Garbage Collector is enabled');
    } else {
      logger.trace('Garbage Collector is disabled, you should use --expose-gc');
    }
  }

  registerEventHandlers() {
    this.eventEmitter.on('Init JsRunner', (runLogicConnectionOptions) => {
      this.runLogicClient.connect(runLogicConnectionOptions)
        .then(() => {
          this.loadRunner = new JSRunner();
          return this.loadRunner.initialize({
            host: runLogicConnectionOptions.address,
            port: runLogicConnectionOptions.port,
            logLevel: logger.getLevel(),
            onLogMessage: (message, level) => {
              this.runLogicClient.logMessage(message, level);
            },
            inspectUserScript: runLogicConnectionOptions.inspectUserScript,
            inspectorAddress: runLogicConnectionOptions.inspectorAddress,
            inspectorPort: runLogicConnectionOptions.inspectorPort,
            gcInterval: runLogicConnectionOptions.gcInterval
          });
        })
        .then(
          () => {
            this.orchestratorClient.notifyInitializationStatus(constants.status.success);
          },
          () => {
            this.orchestratorClient.notifyInitializationStatus(constants.status.error);
          });
    });

    this.eventEmitter.on('Validate', (scriptOptions) => {
      const options = {
        script: {
          fullPath: path.join(scriptOptions.scriptDirectory, 'main.js'),
          additionalFiles: scriptOptions.additionalFiles && scriptOptions.additionalFiles.map(filename => {
            return [filename, path.dirname(filename)];
          })
        }
      };
      this.loadRunner.validate(options)
        .then(
          () => {
            this.orchestratorClient.notifyValidationStatus(constants.status.success, 'script has been validated successfully');
          },
          (err) => {
            this.orchestratorClient.notifyValidationStatus(constants.status.failure, err.message);
          });
    });

    this.eventEmitter.on('Create Vusers', (options, callback) => {
      this.loadRunner.runVUsers(options)
        .then((readyVusers) => {
          callback(null, readyVusers);
        })
        .catch((ex) => {
          callback(ex, null);
        });
    });

    this.eventEmitter.on('Run Vuser', (vuserId, stage, flow) => {
      this.loadRunner.runVUserStage(vuserId, stage, flow);
    });

    this.eventEmitter.on('Close Runner', () => {
      Promise.resolve()
        .then(() => {
          if (this.loadRunner) {
            return this.loadRunner.stopRunner();
          }
        })
        .catch((err) => {
          this.runLogicClient.logMessage(`There was an error while closing the runner: ${err.message}`, 'error');
        })
        .finally(() => {
          this.runLogicClient.stop();
          this.orchestratorClient.close();
        });
    });

    this.eventEmitter.on('Stop Runner', () => {
      this.orchestratorClient.stop();
    });

    this.eventEmitter.on('Stop Vuser', (vuserId) => {
      this.loadRunner.stopVuser(vuserId).catch((err) => {
        this.runLogicClient.logMessage(`There was an error while stopping a vuser: ${err.message}`, 'error');
      });
    });
  }

  start() {
    this.orchestratorClient.connect(this.options);
  }
}

module.exports = Controller;
