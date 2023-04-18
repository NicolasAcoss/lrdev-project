'use strict';

// use console wrapper so console works properly in unit test
const jsRunnerConsole = require('./console.js');
const consts = require('./common/constants.js');
const {
  capitalizeFirstLetter,
  getTimeStamp
} = require('./utils/helpers.js');
const logLevels = {
  trace: 0,
  debug: 1,
  info: 2,
  warning: 3,
  error: 4
};

module.exports = {
  level: 'info',
  levelIndex: logLevels['info'],
  showInConsole: false,

  formatMessage(level, message) {
    return `[${getTimeStamp()}] ${capitalizeFirstLetter(level)}: ${message}`;
  },
  setLoggerInfo(configuration) {
    const {
      logLevel,
      showInConsole
    } = configuration;
    this.setShowInConsole(showInConsole);
    this.setLevel(logLevel);
  },

  setShowInConsole(showInConsole) {
    this.showInConsole = showInConsole === 'true' || showInConsole === true;
  },
  setLevel: function(level) {
    if (logLevels[level] === undefined) {
      this.level = 'info';
      this.levelIndex = logLevels['info'];
      this.trace(`Warning: Invalid log level configuration "${level}"`);
    } else {
      this.level = level;
      this.levelIndex = logLevels[level];
    }
  },

  getLevel: function() {
    return this.level;
  },

  needToLog: function(level) {
    return this.showInConsole && logLevels[level] >= 0 && this.levelIndex <= logLevels[level];
  },

  log: function(message, level) {
    if (this.needToLog(level)) {
      jsRunnerConsole.log(this.formatMessage(level, message));
    }
  },

  trace: function(message) {
    this.log(message, consts.logLevel.trace);
  },

  debug: function(message) {
    this.log(message, consts.logLevel.debug);
  },

  info: function(message) {
    this.log(message, consts.logLevel.info);
  },

  warning: function(message) {
    this.log(message, consts.logLevel.warning);
  },

  error: function(message) {
    this.log(message, consts.logLevel.error);
  }
};
