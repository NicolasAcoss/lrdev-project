'use strict';

const inspector = require('inspector');
const path = require('path');
const logger = require('./logger.js');
const os = require('os');
const Bogatyr = require('./bogatyr/bogatyr.js');
const utils = require('./vuser/utils.js');
const fs = require('fs');
const vm = require('vm');

function getScriptFile(scriptDirectory) {
  return path.join(scriptDirectory, 'main.js');
}

class JSRunner {
  async initialize(options) {
    this.bogatyr = new Bogatyr(options);
    this.onLogMessage = options.onLogMessage;
    await this.bogatyr.initialize();
    this.inspectUserScript = options.inspectUserScript || false;
    this.inspectorAddress = options.inspectorAddress;
    this.inspectorPort = options.inspectorPort;
    this.gcInterval = options.gcInterval;
  }

  initVusersStructs(options) {
    const vusersData = [];
    const {vusers, scriptName, scriptDirectory, userArgs, additionalFiles} = options;
    const userScriptFullPath = getScriptFile(scriptDirectory);
    const userScriptTemplatePath = path.join(__dirname, 'vuser', 'user_script_template.js');
    const gcInterval = this.gcInterval;
    for (let userIndex = 0; userIndex < vusers.length; userIndex++) {
      const vuserId = vusers[userIndex];
      const vuserConfiguration = {
        vuserId,
        userScriptTemplatePath,
        args: {
          gcInterval,
          logLevel: logger.getLevel(),
          env: Object.assign({}, process.env),
          user: {
            userId: vuserId,
            args: userArgs
          },
          host: {
            name: os.hostname(),
            arch: process.arch,
            platform: process.platform
          },
          script: {
            name: scriptName,
            fullPath: userScriptFullPath,
            directory: scriptDirectory,
            additionalFiles: additionalFiles && additionalFiles.map(filename => {
              return [filename, path.dirname(filename)];
            })
          }
        }
      };
      vusersData.push(vuserConfiguration);
    }
    return vusersData;
  }

  runVUsers(options) {
    const vusers = this.initVusersStructs(options);
    const promises = [];
    vusers.forEach(vuserConfiguration => {
      promises.push(this.bogatyr.runVuser(vuserConfiguration));

      //set inspector config if enabled
      if (this.inspectUserScript) {
        this.onLogMessage(`Inspector enabled on ${this.inspectorAddress}:${this.inspectorPort}`, 'info');
        inspector.open(this.inspectorPort, this.inspectorAddress);
        inspector.waitForDebugger();
      }
    });
    return Promise.all(promises);
  }

  async validate(options) {
    return Promise.resolve().then(() => {
      let scriptCode = fs.readFileSync(options.script.fullPath, 'utf8');
      let script = new vm.Script(scriptCode, {filename: options.script.fullPath});
      if (options.script.additionalFiles) {
        for (const fileTuple of options.script.additionalFiles) {
          scriptCode = fs.readFileSync(fileTuple[0], 'utf8');
          script = new vm.Script(scriptCode, {filename: fileTuple[0]});
          script.toString(); // avoid eslint error
        }
      }
    })
      .catch((err) => {
        throw new Error(`"${err.message}" thrown at ${utils.getErrorPosition(err)}`);
      });
  }

  runVUserStage(vuserId, stage, flow) {
    const args = {stage, flow} || {};
    this.bogatyr.runVuserStage(vuserId, args);
  }

  async stopRunner() {
    await this.bogatyr.stopAllVusers();
  }

  async stopVuser(vuserId) {
    await this.bogatyr.stopVuser(vuserId);
  }
}

module.exports = JSRunner;
