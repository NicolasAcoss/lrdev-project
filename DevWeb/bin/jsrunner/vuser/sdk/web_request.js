'use strict';

const {
  isFunction,
  isUndefined,
  isString,
  isArray,
  isObject,
  isEmpty,
  isNil,
  isRegExp
} = require('./../../utils/validator.js');
const {cloneDeep, defaultsDeep} = require('./../../utils/objects.js');
const message = require('./../message.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

module.exports = function(load) {
  const {internalLog, LogLevel} = require('./../utils/log_utils.js')(load);
  const requestUtils = require('./../utils/request_utils.js')(load);

  function handleResponseError(request, errorWithWebResponse) {
    if (errorWithWebResponse.type === 'HTTP') {
      errorWithWebResponse.message = `HTTP Status-Code=${errorWithWebResponse.content.status} for ${request.url}`;
      if (isFunction(request.handleHTTPError)) {
        const webResponse = new load.WebResponse(errorWithWebResponse.content, request);
        const callbackResult = request.handleHTTPError(webResponse);
        if (callbackResult !== false) {
          throw errorWithWebResponse;
        }
        requestUtils.handleResponseExtractors(request, errorWithWebResponse.content, webResponse);
        return webResponse;
      }
      if (isString(request.handleHTTPError)) {
        internalLog(new Error(request.handleHTTPError), LogLevel.error, errorWithWebResponse.code);
        return new load.WebResponse(errorWithWebResponse.content, request);
      }
      throw errorWithWebResponse;
    }
    throw errorWithWebResponse;
  }

  function prepareWebRequest(webRequest) {
    const result = cloneDeep(webRequest);
    if (!isEmpty(result.body)) {
      if (result.body instanceof MultipartBody) {
        result.multipartBody = result.body;
        result.body = undefined;
      } else if (Buffer.isBuffer(result.body)) {
        result.body = result.body.toString('base64');
        result.isBodyBinary = true;
      } else if (isObject(result.body)) {
        if (getContentType(result.headers) === 'application/json') {
          result.body = requestUtils.escapeCharCleaner(JSON.stringify(result.body));
        } else {
          result.formBody = prepareKeyValue(result.body);
          result.body = undefined;
        }
      }
    }
    if (!isEmpty(result.queryString) && !isArray(result.queryString) && isObject(result.queryString)) {
      result.queryString = prepareKeyValue(result.queryString);
    }
    requestUtils.handleRequestExtractors(result);
    return result;
  }

  function getContentType(headers) {
    const keys = Object.keys(headers);
    for (const key of keys) {
      if (key.trim().toLowerCase() === 'content-type') {
        if (headers[key] === '') {
          return '';
        }
        return headers[key].split(';')[0].trim().toLowerCase();
      }
    }
    return '';
  }

  function prepareKeyValue(queryString) {
    const keyValueArray = [];
    const keys = Object.keys(queryString);
    keys.forEach((key) => {
      const value = queryString[key];
      if (isUndefined(value)) {
        return;
      }
      if (isNil(value)) {
        keyValueArray.push([key, '']);
        return;
      }
      if (isArray(value)) {
        value.forEach((innerValue) => {
          keyValueArray.push([key, innerValue]);
        });
        return;
      }
      keyValueArray.push([key, String(value)]);
    });
    return keyValueArray;
  }

  class WebResponse {
    constructor(rawWebResponse, request) {
      requestUtils.copyPropertiesFromRawResponse('WebRequest', this, rawWebResponse, request.isBinaryContent);
      this.request = request;
    }

    textCheck(expr) {
      if (isNil(this.body)) {
        throw new LoadError(ErrorTypes.WebRequest, `WebRequest (${this.request.url}) body was not returned. Did you set the "returnBody" property to true?`, null, ErrorCodes.sdk);
      }
      if (isString(expr)) {
        return this.body.includes(expr);
      }
      if (isRegExp(expr)) {
        return this.body.search(expr) !== -1;
      }

      throw new LoadError(ErrorTypes.WebRequest, 'textCheck must be called with a string or a regular expression', null, ErrorCodes.sdk);
    }
  }

  const defaults = {
    method: 'GET',
    headers: {},
    resources: [],
    handleHTTPError: null,
    body: '',
    returnBody: false,
    isBinaryResponse: false,
    forceAuthentication: false,
    queryString: [],
    extractors: [],
    multipartBody: null,
    formDelimiter: '&'
  };

  function generateResponse(request, responseData) {
    const response = new WebResponse(responseData.webResponse, request);
    requestUtils.updateRequestHeaders(request, responseData);
    requestUtils.handleResponseExtractors(request, responseData.webResponse, response);
    return response;
  }

  class WebRequest {
    constructor(options) {
      let actualOptions = options || {};
      if (isString(options)) { //Allow new WebRequest('www.foo.bar') shorthand
        actualOptions = {
          url: options
        };
      }
      if (!isString(actualOptions.url)) {
        throw new LoadError(ErrorTypes.WebRequest, 'WebRequest options must have a "url" property', null, ErrorCodes.sdk);
      }
      defaultsDeep(this, cloneDeep(actualOptions), cloneDeep(defaults));
    }

    static get defaults() {
      return defaults;
    }

    send() {
      return message.sendMessage('WebRequest.SendAsync', load.config.user.userId, prepareWebRequest(this))
        .then((response) => {
          if (response instanceof LoadError) {
            return handleResponseError(this, response);
          }
          return generateResponse(this, response);
        });
    }

    sendSync() {
      const response = message.sendMessageSync('WebRequest.SendSync', load.config.user.userId, prepareWebRequest(this));
      if (response instanceof LoadError) {
        return handleResponseError(this, response);
      }
      return generateResponse(this, response);
    }
  }

  class MultipartBody {
    constructor(entries, boundary) {
      if (!isArray(entries)) {
        throw new LoadError(ErrorTypes.WebRequest, 'entries must be an array of multipart entries', null, ErrorCodes.sdk);
      }
      this.entries = entries.map((value) => {
        if (isArray(value)) {
          const [partType, ...params] = value;
          switch (partType) {
            case 'string':
              return new MultipartBody.StringEntry(...params);
            case 'file':
              return new MultipartBody.FileEntry(...params);
            default:
              throw new LoadError(ErrorTypes.WebRequest, `invalid multipart type ${partType}, only 'string' or 'file' are allowed`, null, ErrorCodes.sdk);
          }
        } else {
          return value;
        }
      });
      this.boundary = boundary;
    }
  }

  MultipartBody.StringEntry = class {
    constructor(name, value) {
      if (!isString(name)) {
        throw new LoadError(ErrorTypes.WebRequest, `name must be a string but ${name} was passed`, null, ErrorCodes.sdk);
      }
      if (!isString(value)) {
        throw new LoadError(ErrorTypes.WebRequest, `value must be a string but ${value} was passed`, null, ErrorCodes.sdk);
      }
      this.name = name;
      this.value = value;
      this.entryType = 'string';
    }
  };

  MultipartBody.FileEntry = class {
    constructor(name, filePath, contentType, fileName) {
      if (!isString(name)) {
        throw new LoadError(ErrorTypes.WebRequest, `name must be a string but ${name} was passed`, null, ErrorCodes.sdk);
      }
      if (!isString(filePath)) {
        throw new LoadError(ErrorTypes.WebRequest, `filePath must be a string but ${filePath} was passed`, null, ErrorCodes.sdk);
      }

      this.name = name;
      this.filePath = filePath;
      this.contentType = contentType;
      this.fileName = fileName;
      this.entryType = 'file';
    }
  };

  return {
    WebRequest,
    WebResponse,
    MultipartBody
  };
};
