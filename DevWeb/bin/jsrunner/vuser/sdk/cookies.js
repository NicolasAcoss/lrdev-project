'use strict';

const {isString, isEmpty, isArray, isObject, isNil} = require('./../../utils/validator.js');
const message = require('./../message.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

module.exports = function(load) {
  const CookiesOperation = {
    add: 'add',
    delete: 'delete',
    clear: 'clear'
  };

  function setCookies(cookies, operation) {
    if (operation === CookiesOperation.clear) {
      return message.sendMessageSync('Cookies.Set', load.config.user.userId, {
        cookies: null,
        operation
      });
    }
    if (!isArray(cookies) && (isObject(cookies) || isString(cookies))) {
      return setCookies([cookies], operation);
    }

    return message.sendMessageSync('Cookies.Set', load.config.user.userId, {
      cookies,
      operation
    });
  }

  function fromString(cookieString) {
    const params = cookieString.split(';');
    const options = {};
    params.forEach((param, index) => {
      if (param.trim() === '') {
        return;
      }
      const splitValue = param.split('=');
      if (index === 0) {
        if (splitValue.length !== 2 || isEmpty(splitValue[0]) || isEmpty(splitValue[1])) {
          throw new LoadError(ErrorTypes.cookies, `invalid cookie name and value, expected format is name=value but ${param} was given`, null, ErrorCodes.sdk);
        }
        options.name = splitValue[0].trim();
        options.value = splitValue[1].trim();
        return;
      }

      if (splitValue.length === 1) {
        if (splitValue[0].trim().toLowerCase() === 'secure') {
          options.isSecure = true;
          return;
        }
        if (splitValue[0].trim().toLowerCase() === 'httponly') {
          options.isHttpOnly = true;
          return;
        }
        throw new LoadError(ErrorTypes.cookies, `invalid cookie parameter, expected format is name=value but ${param} was given`, null, ErrorCodes.sdk);
      }

      if (splitValue[0].trim().toLowerCase() === 'max-age') {
        options.maxAge = Number(splitValue[1].trim());
        return;
      }

      options[splitValue[0].trim().toLowerCase()] = splitValue[1].trim();
    });

    return new Cookie(options);
  }

  class Cookie {
    constructor(options) {
      if (isNil(options)) {
        throw new LoadError(ErrorTypes.cookies, `options must be a string or an object but ${options} was provided`, null, ErrorCodes.sdk);
      }
      if (isString(options)) {
        return fromString(options);
      }
      if (isEmpty(options.name) || isEmpty(options.value) || isEmpty(options.domain)) {
        throw new LoadError(ErrorTypes.cookies, `cookie "name", "value" and "domain" must be set`, null, ErrorCodes.sdk);
      }
      Object.assign(this, options);
    }
  }

  function addCookies(cookies) {
    setCookies(cookies, CookiesOperation.add);
  }

  function deleteCookies(cookies) {
    setCookies(cookies, CookiesOperation.delete);
  }

  function clearCookies() {
    setCookies(null, CookiesOperation.clear);
  }

  return {
    addCookies,
    deleteCookies,
    clearCookies,
    Cookie
  };
};
