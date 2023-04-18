'use strict';

const {isString, isEmpty} = require('./../../utils/validator.js');
const message = require('./../message.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

module.exports = function(load) {
  const net = {
    lookupService(service, protocol, domain) {
      if (!isString(service) || isEmpty(service)) {
        throw new LoadError(ErrorTypes.net, `service must be a non empty string`, null, ErrorCodes.sdk);
      }
      if (!isString(protocol) || isEmpty(protocol)) {
        throw new LoadError(ErrorTypes.net, `protocol must be a non empty string`, null, ErrorCodes.sdk);
      }
      if (!isString(domain) || isEmpty(domain)) {
        throw new LoadError(ErrorTypes.net, `domain must be a non empty string`, null, ErrorCodes.sdk);
      }
      const response = message.sendMessageSync('Net.SRV', load.config.user.userId, {
        service: service,
        protocol: protocol,
        domain: domain
      });
      if (response instanceof LoadError) {
        throw response;
      }
      return response.value;
    }
  };

  return {
    net
  };
};
