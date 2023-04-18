'use strict';

const {isArray, isFunction, isUndefined, specific} = require('./../../utils/validator.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');
const logger = require('./../../logger.js');
/**
 * doubleEscapeCharRegexPattern aim to search exactly two escapse chars which start without escapse
 * and ends without escapse char or foward backslash.
 * i.e:
 * example 1: "opr\\//"" --> will return nothing
 * example 2: {ViewStart:\\/Date(1609624800000)\\\\} --> will find one before the Date.
 */

const doubleEscapeCharRegexPattern = /(?<=[^\\])([\\]{2})(?=[^\\][^/])/;
const doubleEscapeCharRegex = new RegExp(doubleEscapeCharRegexPattern, 'g');

// recursive proxy: defines proxy for the objects and sub-objects
function ProxyHandler(logFunction, LogLevel, name, propType) {
  this.get = function(target, key) {
    if (typeof target[key] === 'object' && target[key] !== null) {
      return new Proxy(target[key], new ProxyHandler(logFunction, LogLevel, name, key));
    } else {
      if (target[key] === null) {
        if (new Error().stack.indexOf('JSON.stringify') === -1) { // not from log or join
          logFunction(`Applying extractor '${key} = ${target[key]}'`, LogLevel.debug);
        }
        return null;
      }
      const isTargetArray = Array.isArray(target);
      if (key === 'length' && isTargetArray) {
        return target[key];
      }
      if (typeof target[key] === 'number' || typeof target[key] === 'string' || typeof target[key] === 'boolean') {
        const stack = new Error().stack;
        if (isTargetArray && !isNaN(key)) { //not came from array index
          if (stack.indexOf('Proxy.toString') === -1 && stack.indexOf('JSON.stringify') === -1) { // not from log or join
            logFunction(`Applying extractor '${propType}[${key}] = ${target[key]}'`, LogLevel.debug);
          }
        } else {
          if (stack.indexOf('JSON.stringify') === -1) {
            logFunction(`Applying extractor '${key} = ${target[key]}'`, LogLevel.debug);
          }
        }
      }
      return target[key];
    }
  };
}

function getObjectIfNotEmpty(obj) {
  const empty = obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype;
  if (empty) {
    return;
  }
  return obj;
}

module.exports = function(load) {
  const {internalLog, LogLevel} = require('./log_utils.js')(load);

  function stripBOM(content) {
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return content;
  }

  return {
    handleResponseError(error) {
      if (error.type === 'TCP' || error.type === 'Engine') {
        error.message = `${error.content.message}`;
        throw error;
      }
      throw error;
    },

    shouldLogExtractorsSubstitution() {
      return logger.getLevel() >= LogLevel.debug;
    },

    handleResponseExtractors(request, responseData, response) {
      if (this.shouldLogExtractorsSubstitution()) {
        load.extractors = getObjectIfNotEmpty(load.extractors) || new Proxy({}, new ProxyHandler(internalLog, LogLevel, 'load'));
      }
      if (isArray(request.extractors) && responseData.extractors) {
        request.extractors.forEach((extractor) => {
          load.extractors[extractor.name] = responseData.extractors[extractor.name];
          if (isFunction(extractor.options.transform) && !isUndefined(responseData.extractors[extractor.name])) {
            response.extractors[extractor.name] = extractor.options.transform(responseData.extractors[extractor.name], request, response);
            load.extractors[extractor.name] = response.extractors[extractor.name];
            responseData.extractors[extractor.name] = response.extractors[extractor.name];
          }
          if (!isUndefined(extractor.options.failOn) && response.extractors[extractor.name] === extractor.options.failOn) {
            internalLog(`Replay failed by extractor "${extractor.name}" as "failOn=${extractor.options.failOn}"`, LogLevel.error, ErrorCodes.extractors);
            load.exit(load.ExitType.iteration, `Replay aborted by extractor "${extractor.name}"`);
          }
        });
      }
      if (this.shouldLogExtractorsSubstitution()) {
        const responseExtractors = responseData.extractors || {};
        response.extractors = new Proxy(responseExtractors, new ProxyHandler(internalLog, LogLevel, 'response'));
      }
    },
    handleRequestExtractors(request) {
      let extractors = request.extractors;
      if (!isUndefined(extractors) && !isArray(extractors)) {
        extractors = [request.extractors];
      }
      if (isArray(extractors)) {
        extractors.forEach((extractor) => {
          if (!specific.isExtractor(extractor)) {
            throw new LoadError(ErrorTypes.extractors, `extractors must be an array of Extractor types but ${request.extractors} was given`, null, ErrorCodes.sdk);
          }
        });
      }
      request.extractors = extractors;
    },

    updateRequestHeaders(request, responseData) {
      request.headers = responseData.webRequestSupplement.headers;
    },

    /**
     * Clean exactly two following escape chars, otherwise keep str the same.
     * @param {*} str
     * @returns the replaced string (str)
     */
    escapeCharCleaner(str) {
      return str.replace(doubleEscapeCharRegex, '\\');
    },

    copyPropertiesFromRawResponse(name, newResponse, rawResponse, isBinaryContent) {
      let jsonBody;
      let body = rawResponse.body || undefined;
      if (isBinaryContent && body !== undefined) {
        body = Buffer.from(body, 'base64');
      }
      Object.assign(newResponse, rawResponse);
      Object.defineProperty(newResponse, 'jsonBody', {
        enumerable: true,
        get: function() {
          if (jsonBody === undefined) {
            try {
              jsonBody = JSON.parse(stripBOM(this.body));
            } catch (e) {
              jsonBody = null;
              internalLog(new Error(`${name} parse error: ${e.message}`), LogLevel.error, ErrorCodes.parsing);
            }
          }
          return jsonBody;
        }
      });
      Object.defineProperty(newResponse, 'body', {
        enumerable: true,
        get: function() {
          if (body === undefined && !this.request.returnBody) {
            body = null;
            internalLog(new Error(`${name} (${this.request.id}) body was not returned. Did you set the "returnBody" property to true?`), LogLevel.error, ErrorCodes.sdk_logic);
          }
          return body;
        }
      });
    }
  };
};
