'use strict';

module.exports = {
  logLevel: {
    trace: 'trace',
    debug: 'debug',
    info: 'info',
    warning: 'warning',
    error: 'error'
  },
  status: {
    success: 'success',
    error: 'error',
    failure: 'failure',
    start: 'start'
  },

  state: {
    live: 'live',
    init: 'init',
    create: 'create',
    run: 'run',
    validate: 'validate',
    close: 'close',
    stop: 'stop',
    stage: 'stage',
    log: 'log'
  },

  flowControlMessageType: 'VUsers.Status',
  appLoaderMessageType: 'AppLoader.Status',

  JSRunner: 3
};
