'use strict';

const {LoadError, ErrorTypes} = require('./../load_error.js');
const message = require('./../message.js');
const {validateValuesAreStrings} = require('../../utils/validator');

module.exports = function(load) {
  const azure = {
    getToken(vaultName, tenantId, clientId, clientSecret) {
      const content = {
        vaultName: vaultName,
        tenantId: tenantId,
        clientId: clientId,
        clientSecret: clientSecret
      };
      validateValuesAreStrings(content, ErrorTypes.azure);
      const response = message.sendMessageSync('Azure.GetToken', load.config.user.userId, content);
      if (response instanceof LoadError) {
        throw response;
      }
      return response.value;
    },

    getSecret(secret, token) {
      const content = {
        secret: secret,
        token: token
      };
      validateValuesAreStrings(content, ErrorTypes.azure);
      const response = message.sendMessageSync('Azure.GetSecret', load.config.user.userId, content);
      if (response instanceof LoadError) {
        throw response;
      }
      return response.value;
    }
  };

  return {
    azure
  };
};
