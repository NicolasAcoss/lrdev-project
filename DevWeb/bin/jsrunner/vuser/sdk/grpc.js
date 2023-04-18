'use strict';

const {isString, isUndefined, isObject, isArray} = require('./../../utils/validator.js');
const {cloneDeep, defaultsDeep} = require('./../../utils/objects.js');
const message = require('./../message.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

module.exports = function(load) {
  const requestUtils = require('./../utils/request_utils.js')(load);

  function handleResponseError(error) {
    if (error.type === ErrorTypes.grpc) {
      error.message = `${error}`;
      throw error;
    }
    throw error;
  }

  const defaults = {
    headers: {},
    protoFile: '',
    body: '',
    bodyArray: [],
    returnBody: false,
    extractors: []
  };

  function generateResponse(request, responseData) {
    const response = new GrpcResponse(responseData, request);
    requestUtils.handleResponseExtractors(request, responseData, response);
    return response;
  }

  function prepareRequest(request) {
    const result = cloneDeep(request);
    if (isObject(result.body)) {
      result.body = `${JSON.stringify(result.body).replace(/\\\\/g, '\\')}`;
    }
    if (isArray(request.bodyArray)) {
      const body = [];
      request.bodyArray.forEach((part) => {
        if (isObject(part)) {
          body.push(`${JSON.stringify(part).replace(/\\\\/g, '\\')}`);
        } else {
          body.push(part);
        }
      });
      result.bodyArray = body;
    }
    requestUtils.handleRequestExtractors(result);
    return result;
  }

  function prepareMethod(method, defaultOptions, options) {
    defaultsDeep(method, cloneDeep(options), cloneDeep(defaultOptions));
    if (!isString(method.method)) {
      throw new LoadError(ErrorTypes.grpc, `Method must not be empty but ${method.method} was sent`, null, ErrorCodes.sdk);
    }
    if (!isString(method.protoFile)) {
      throw new LoadError(ErrorTypes.grpc, `protoFile must not be empty but ${method.protoFile} was sent`, null, ErrorCodes.sdk);
    }
  }

  function createAsyncSendMessage(grpcType, methodMessage) {
    const request = prepareRequest(grpcType);
    request.client = grpcType.client;
    return message.sendMessage(methodMessage, load.config.user.userId, request)
      .then((response) => {
        if (response instanceof LoadError) {
          return handleResponseError(response, grpcType);
        }
        return generateResponse(grpcType, response);
      });
  }

  class GrpcUnaryRequest {
    constructor(client, options) {
      this.client = client;
      prepareMethod(this, client.defaults, options);
    }

    sendSync() {
      const request = prepareRequest(this);
      request.client = this.client;
      const response = message.sendMessageSync('GrpcClient.InvokeRpc', load.config.user.userId, request);
      if (response instanceof LoadError) {
        return handleResponseError(response, this);
      }
      return generateResponse(this, response);
    }

    send() {
      return createAsyncSendMessage(this, 'GrpcClient.InvokeRpc');
    }
  }

  class GrpcClientStreamRequest {
    constructor(client, options) {
      this.client = client;
      prepareMethod(this, client.defaults, options);
    }

    sendSync() {
      const request = prepareRequest(this);
      request.client = this.client;
      const response = message.sendMessageSync('GrpcClient.ClientStream', load.config.user.userId, request);
      if (response instanceof LoadError) {
        return handleResponseError(response, this);
      }
      return generateResponse(this, response);
    }

    send() {
      return createAsyncSendMessage(this, 'GrpcClient.ClientStream');
    }
  }

  class GrpcServerStreamRequest {
    constructor(client, options) {
      this.client = client;
      prepareMethod(this, client.defaults, options);
    }

    sendSync() {
      const request = prepareRequest(this);
      request.client = this.client;
      const response = message.sendMessageSync('GrpcClient.ServerStream', load.config.user.userId, request);
      if (response instanceof LoadError) {
        return handleResponseError(response, this);
      }
      return generateResponse(this, response);
    }

    send() {
      return createAsyncSendMessage(this, 'GrpcClient.ServerStream');
    }
  }

  class GrpcClient {
    constructor(options) {
      let actualOptions = options || {};
      if (isString(options)) { //Allow new GrpcClient('myHost') shorthand
        actualOptions = {
          host: options
        };
      }
      if (!isString(actualOptions.host)) {
        throw new LoadError(ErrorTypes.grpc_client, 'GrpcClient options must have a "host" property', null, ErrorCodes.sdk);
      }
      if (isUndefined(actualOptions.ignoreBadCertificate)) {
        actualOptions.ignoreBadCertificate = true;
      }
      this.defaults = defaultsDeep({}, cloneDeep(actualOptions.defaults));
      Object.assign(this, actualOptions);
    }

    static get defaults() {
      return defaults;
    }

    unaryRequest(options) {
      options = options || {};
      return new GrpcUnaryRequest(this, options);
    }

    clientStreamRequest(options) {
      options = options || {};
      return new GrpcClientStreamRequest(this, options);
    }

    serverStreamRequest(options) {
      options = options || {};
      return new GrpcServerStreamRequest(this, options);
    }
  }

  class GrpcResponse {
    constructor(options, request) {
      this.request = request;
      requestUtils.copyPropertiesFromRawResponse('Grpc', this, options, request.isBinaryContent);
    }
  }

  return {
    GrpcClient,
    GrpcUnaryRequest,
    GrpcClientStreamRequest,
    GrpcResponse
  };
};
