'use strict';
const StackedError = require('./stacked_error.js');
const positionRegExp = /\(.*:\d+:\d+\)$/;
const v8PositionRegExp = /^.*:\d+$/;

function parentesize(value) {
  let prefix = '';
  if (value === '' || value[0] !== '(') {
    prefix = '(';
  }

  let suffix = '';
  if (value === '' || (value[value.length - 1]) !== ')') {
    suffix = ')';
  }

  return `${prefix}${value}${suffix}`;
}

module.exports = {
  logLevel: 'info',
  scriptDirectory: '',
  initialize(logLevel, scriptDirectory) {
    this.logLevel = logLevel;
    this.scriptDirectory = scriptDirectory;
  },
  getErrorPosition(error) {
    while (error instanceof StackedError) {
      error = error.originalError;
    }
    const stack = error.stack;
    const splitStack = stack.split('\n');

    for (const line of splitStack) {
      const linuxLine = line.replace(/\\/g, '/');
      let validRegexp = null;
      if (positionRegExp.test(line)) {
        validRegexp = positionRegExp;
      } else if (v8PositionRegExp.test(line)) {
        validRegexp = v8PositionRegExp;
      }

      if (validRegexp) {
        if (line.includes(this.scriptDirectory)) {
          return parentesize(validRegexp.exec(line)[0].replace(this.scriptDirectory, '.'));
        }
        if (linuxLine.includes(this.scriptDirectory)) {
          return parentesize(validRegexp.exec(linuxLine)[0].replace(this.scriptDirectory, '.'));
        }
      }
    }

    return '';
  },
  getDebugErrorPosition() {
    const error = new Error();
    return this.getErrorPosition(error);
  }
};
