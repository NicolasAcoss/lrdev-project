'use strict';

const {isString, isEmpty} = require('./../../utils/validator.js');
const {cloneDeep} = require('./../../utils/objects.js');
const message = require('./../message.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

module.exports = function(load) {
  const requestUtils = require('./../utils/request_utils.js')(load);

  function generateResponse(fileData, responseData) {
    const response = cloneDeep(responseData);
    requestUtils.handleResponseExtractors(fileData, responseData, response);
    if (fileData.isBinaryContent) {
      response.content = Buffer.from(response.content, 'base64');
    }
    return response;
  }

  class File {
    constructor(path) {
      if (!isString(path) || isEmpty(path)) {
        throw new LoadError(ErrorTypes.file, `path must be a non empty string but ${path} was given`, null, ErrorCodes.sdk);
      }
      this.path = path;
    }

    read(options) {
      const data = Object.assign({
        path: this.path,
        returnContent: true,
        forceRead: false,
        isBinaryContent: false,
        extractors: []
      }, options);
      requestUtils.handleRequestExtractors(data);

      const response = message.sendMessageSync('File.Read', load.config.user.userId, data);
      if (response instanceof LoadError) {
        throw response;
      }
      return generateResponse(data, response);
    }

    append(content) {
      let isBinaryData = false;
      if (Buffer.isBuffer(content)) {
        content = content.toString('base64');
        isBinaryData = true;
      }
      const response = message.sendMessageSync('File.Append', load.config.user.userId, {
        path: this.path,
        content,
        isBinaryData
      });
      if (response instanceof LoadError) {
        throw response;
      }
      return response;
    }

    write(content) {
      let isBinaryData = false;
      if (Buffer.isBuffer(content)) {
        content = content.toString('base64');
        isBinaryData = true;
      }
      const response = message.sendMessageSync('File.Write', load.config.user.userId, {
        path: this.path,
        content,
        isBinaryData
      });
      if (response instanceof LoadError) {
        throw response;
      }
      return response;
    }

    isExists() {
      const response = message.sendMessageSync('File.IsExists', load.config.user.userId, {
        path: this.path
      });

      if (response instanceof LoadError) {
        throw response;
      }
      return response;
    }
  }

  return {
    File
  };
};
