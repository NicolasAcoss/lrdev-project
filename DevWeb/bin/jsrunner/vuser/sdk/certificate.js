'use strict';

const {isString, isEmpty} = require('./../../utils/validator.js');
const message = require('./../message.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

module.exports = function(load) {
  return {
    setUserCertificate(certFilePath, keyFilePath, password) {
      if (isEmpty(certFilePath)) {
        throw new LoadError(ErrorTypes.cert, 'certFilePath should not be empty', null, ErrorCodes.sdk);
      }
      if (!isString(certFilePath)) {
        throw new LoadError(ErrorTypes.cert, `certFilePath must be a string but ${certFilePath} was given`, null, ErrorCodes.sdk);
      }
      if (isEmpty(keyFilePath)) {
        throw new LoadError(ErrorTypes.cert, 'keyFilePath should not be empty', null, ErrorCodes.sdk);
      }
      if (!isString(keyFilePath)) {
        throw new LoadError(ErrorTypes.cert, `keyFilePath must be a string but ${keyFilePath} was given`, null, ErrorCodes.sdk);
      }
      message.sendMessageSync('Certificate.Set', load.config.user.userId, {
        certFilePath,
        keyFilePath,
        password
      });
    }
  };
};
