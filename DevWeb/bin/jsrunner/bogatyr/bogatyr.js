'use strict';

const Communicator = require('./communicator.js');
const Executor = require('./executor.js');
const {DualMutex} = require('./internal/mutex.js');
const {isUndefined} = require('./../utils/validator.js');
const {MessageChannel} = require('worker_threads');

class SingleVuserExecutionManager {
  constructor(uid, communicator, executor) {
    this.uid = uid;
    this.communicator = communicator;
    this.executor = executor;
    this.mutex = new DualMutex();
  }

  async initVuser() {
    const {port1, port2} = new MessageChannel(); //port1 and port2 is an idiomatic Node.js terminology. I left the names to comply.
    await this.communicator.initVuser(this.uid, port1, this.mutex);
    await this.executor.initVuser(this.uid, port2, this.mutex);
  }

  async run(vuserConfiguration) {
    await this.executor.run(vuserConfiguration);
  }

  runVuserStage(args) {
    this.executor.runVuserStage(args);
  }

  async stop() {
    await this.executor.stop();
  }
}

class Bogatyr {
  constructor({logLevel, onLogMessage, host, port}) {
    this.logLevel = logLevel;
    this.onLogMessage = onLogMessage;
    this.host = host;
    this.port = port;
    this.vusers = new Map();
  }

  async initialize() {
    this.communicator = new Communicator({
      host: this.host,
      port: this.port,
      onLogMessage: this.onLogMessage
    });
    await this.communicator.initialize();
  }

  async runVuser(vuserConfiguration) {
    const executor = new Executor({
      onLogMessage: this.onLogMessage
    });
    const executionManager = new SingleVuserExecutionManager(vuserConfiguration.vuserId, this.communicator, executor);
    this.vusers.set(vuserConfiguration.vuserId, executionManager);
    await executionManager.initVuser();
    await executionManager.run(vuserConfiguration);
    return vuserConfiguration.vuserId;
  }

  runVuserStage(vuserId, args) {
    const executionManager = this.vusers.get(vuserId);
    if (isUndefined(executionManager)) {
      throw new Error(`vuser with id ${vuserId} has no execution manager`);
    }
    executionManager.runVuserStage(args);
  }

  async stopVuser(vuserId) {
    const executionManager = this.vusers.get(vuserId);
    if (isUndefined(executionManager)) {
      throw new Error(`vuser with id ${vuserId} has no execution manager`);
    }
    await executionManager.stop();
  }

  async stopAllVusers() {
    for (const key of this.vusers.keys()) {
      await this.stopVuser(key);
    }
    await this.communicator.stop();
  }
}

module.exports = Bogatyr;
