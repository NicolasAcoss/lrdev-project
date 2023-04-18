'use strict';

class LoadError extends Error {
  constructor(errorType, message, content, code) {
    super(message);
    this.type = errorType;
    this.content = content;
    this.code = code ?? 0;
  }
}

const ErrorTypes = {
  auth: 'authtication',
  azure: 'azure',
  cert: 'certificate',
  cookies: 'cookies',
  extractors: 'extractors',
  file: 'file',
  flow: 'flow control',
  grpc: 'gRPC',
  grpc_client: 'gRPC client',
  rendezvous: 'rendezvous',
  timers: 'timers',
  transactions: 'transactions',
  WebSocket: 'WebSocket',
  WebRequest: 'WebRequest',
  utils: 'utils',
  net: 'net',
  vts: 'VTS',
  validation: 'script validation',
  internal: 'RunnerInternalError'
};

module.exports = {
  LoadError,
  ErrorTypes
};
