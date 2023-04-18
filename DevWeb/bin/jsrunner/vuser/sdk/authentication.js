'use strict';

const {isString, isArray, isEmpty, isUndefined, isFunction} = require('./../../utils/validator.js');
const message = require('./../message.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

module.exports = function(load) {
  const {internalLog, LogLevel} = require('./../utils/log_utils.js')(load);
  const AWSProviderType = {
    Static: 'static',
    Env: 'env',
    Shared: 'shared'
  };

  function verifyAuthenticationRecord(authenticationRecord) {
    if (isEmpty(authenticationRecord.username)) {
      internalLog(new Error(`Authentication must have a username - ${authenticationRecord}`), LogLevel.error, ErrorCodes.sdk);
      return false;
    }
    if (isEmpty(authenticationRecord.password)) {
      internalLog(new Error(`Authentication must have a password - ${authenticationRecord}`), LogLevel.error, ErrorCodes.sdk);
      return false;
    }

    if (isEmpty(authenticationRecord.host)) {
      internalLog(new Error(`Authentication must have a host - ${authenticationRecord}`), LogLevel.error, ErrorCodes.sdk);
      return false;
    }
    return true;
  }

  class AWSAuthentication {
    constructor(providerType, options) {
      if (!isString(providerType)) {
        throw new LoadError(ErrorTypes.auth, `provider type must be a string but ${providerType} was passed`, null, ErrorCodes.sdk);
      }
      if (!Object.values(AWSProviderType).includes(providerType)) {
        throw new LoadError(ErrorTypes.auth, `invalid provider type '${providerType}'. The valid values are: ${Object.values(AWSProviderType).join(', ')}`, null, ErrorCodes.sdk);
      }
      if (providerType === AWSProviderType.Static) {
        if (isUndefined(options) || isEmpty(options)) {
          throw new LoadError(ErrorTypes.auth, `options must be provided for ${AWSProviderType.Static} provider type`, null, ErrorCodes.sdk);
        }
        if (isUndefined(options.accessKeyID) || isEmpty(options.accessKeyID)) {
          throw new LoadError(ErrorTypes.auth, `accessKeyID cannot be empty for ${AWSProviderType.Static} provider type`, null, ErrorCodes.sdk);
        }
      }
      this.providerType = providerType;
      this.options = options;
    }

    _serialize() {
      return {type: 'aws', credentials: {providerType: this.providerType, options: this.options}};
    }
  }

  class HttpAuthentication {
    constructor(data) {
      if (verifyAuthenticationRecord(data)) {
        this.data = data;
      }
    }

    _serialize() {
      return {type: 'http', credentials: this.data};
    }
  }

  function setUserCredentials(authenticationData) {
    if (!isArray(authenticationData)) {
      authenticationData = [authenticationData];
    }
    const result = [];
    authenticationData.forEach((authenticationRecord) => {
      if (isFunction(authenticationRecord._serialize)) {
        result.push(authenticationRecord._serialize());
      } else {
        if (verifyAuthenticationRecord(authenticationRecord)) {
          result.push(new HttpAuthentication(authenticationRecord)._serialize());
        }
      }
    });
    if (result.length > 0) {
      message.sendMessageSync('Authentication.Set', load.config.user.userId, result);
    }
  }

  return {
    setUserCredentials,
    AWSProviderType,
    AWSAuthentication,
    HttpAuthentication
  };
};
