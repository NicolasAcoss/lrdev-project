'use strict';
const {isString, isEmpty, isUndefined, isFunction, isObject, isNil, isNumber} = require('./../../utils/validator.js');
const message = require('./../message.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

module.exports = function(load) {
  const HashAlgorithm = {
    md5: 'md5',
    sha1: 'sha1',
    sha256: 'sha256',
    sha384: 'sha384',
    sha512: 'sha512'
  };
  const HashOutputEncoding = {
    base64: 'base64',
    base64Raw: 'base64Raw',
    base64URL: 'base64URL',
    base64RawURL: 'base64RawURL',
    hex: 'hex'
  };
  const TotpAlgorithm = {
    sha1: 0,
    sha256: 1,
    sha512: 2,
    md5: 3
  };

  const TotpDefaultOptions = {
    period: 30,
    skew: 1,
    digits: 6
  };

  function validateTOTPOptions(options) {
    if (!isUndefined(options.skew) && (!isNumber(options.skew) || options.skew < 0)) {
      throw new LoadError(ErrorTypes.utils, `TOTP skew option must be a non-negative integer but ${options.skew} [${typeof options.skew}] was sent`, null, ErrorCodes.sdk);
    }
    if (!isUndefined(options.period) && (!isNumber(options.period) || options.period < 1)) {
      throw new LoadError(ErrorTypes.utils, `TOTP period option must be a positive integer but ${options.period} [${typeof options.period}] was sent`, null, ErrorCodes.sdk);
    }
    if (!isUndefined(options.digits) && (!isNumber(options.digits) || options.digits < 4)) {
      throw new LoadError(ErrorTypes.utils, `TOTP digits option must be a positive integer bigger than 3 but ${options.digits} was sent`, null, ErrorCodes.sdk);
    }
    if (!isUndefined(options.algorithm) && (!Object.values(HashAlgorithm).includes(options.algorithm) || options.algorithm === HashAlgorithm.sha384)) {
      throw new LoadError(ErrorTypes.utils, `invalid TOTP Hash algorithm type '${options.algorithm}'. The valid values are: sha1, sha256, sha512, md5`, null, ErrorCodes.sdk);
    }
  }

  function getTotpAlgorithm(algorithm) {
    switch (algorithm) {
      case HashAlgorithm.sha1:
        return TotpAlgorithm.sha1;
      case HashAlgorithm.sha256:
        return TotpAlgorithm.sha256;
      case HashAlgorithm.sha512:
        return TotpAlgorithm.sha512;
      case HashAlgorithm.md5:
        return TotpAlgorithm.md5;
      default:
        return TotpAlgorithm.sha1;
    }
  }

  function validateHashArguments(algorithm, input, outputEncoding) {
    if (!isString(algorithm)) {
      throw new LoadError(ErrorTypes.utils, `algorithm must be a string but ${algorithm} was sent`, null, ErrorCodes.sdk);
    }
    if (isEmpty(algorithm)) {
      throw new LoadError(ErrorTypes.utils, `algorithm cannot be empty`, null, ErrorCodes.sdk);
    }
    if (!Object.values(HashAlgorithm).includes(algorithm)) {
      throw new LoadError(ErrorTypes.utils, `invalid algorithm type '${algorithm}'. The valid values are: ${Object.values(HashAlgorithm).join(', ')}`, null, ErrorCodes.sdk);
    }
    if (!isString(input)) {
      throw new LoadError(ErrorTypes.utils, `input must be a string but ${input} was sent`, null, ErrorCodes.sdk);
    }
    if (isEmpty(input)) {
      throw new LoadError(ErrorTypes.utils, `input cannot be empty`, null, ErrorCodes.sdk);
    }
    if (!isUndefined(outputEncoding) && !isString(outputEncoding)) {
      throw new LoadError(ErrorTypes.utils, `output encoding must be a string but ${outputEncoding} was sent`, null, ErrorCodes.sdk);
    }
    if (!Object.values(HashOutputEncoding).includes(outputEncoding)) {
      throw new LoadError(ErrorTypes.utils, `invalid output encoding '${outputEncoding}'. The valid values are: ${Object.values(HashOutputEncoding).join(', ')}`, null, ErrorCodes.sdk);
    }
  }

  class Chain {
    constructor(...args) {
      this.chain = [];

      let i = 0;
      while (i < args.length) {
        let func;
        if (isString(args[i])) {
          func = load.utils[args[i]];
        } else if (isFunction(args[i])) {
          func = args[i];
        }

        if (isUndefined(func)) {
          throw new LoadError(ErrorTypes.utils, `Could not find a function ${args[i]} (argument #${i + 1})`, null, ErrorCodes.sdk_logic);
        }
        i++;
        let options = {};
        if (!isFunction(args[i]) && isObject(args[i])) {
          options = args[i];
          i++;
        }
        this.chain.push({
          func,
          options
        });
      }
    }

    run(value) {
      let currentValue = value;
      for (const {func, options} of this.chain) {
        currentValue = func(currentValue, options);
      }
      return currentValue;
    }
  }

  const utils = {
    getByBoundary(source, leftBoundary, rightBoundary) {
      if (isEmpty(source) || !isString(source)) {
        return null;
      }
      let startIndex;
      if (isNil(leftBoundary)) {
        startIndex = 0;
      } else {
        startIndex = source.indexOf(leftBoundary);
        if (startIndex === -1) {
          return null;
        }
      }
      const leftBoundaryLength = (leftBoundary ? leftBoundary.length : 0);
      let endIndex;
      if (isNil(rightBoundary)) {
        endIndex = source.length;
      } else {
        endIndex = source.indexOf(rightBoundary, startIndex + leftBoundaryLength);
        if (endIndex === -1) {
          return null;
        }
      }

      return source.substring(startIndex + leftBoundaryLength, endIndex);
    },

    reportDataPoint(name, value) {
      if (isEmpty(name)) {
        throw new LoadError(ErrorTypes.utils, `data point name must not be empty`, null, ErrorCodes.sdk);
      }
      if (!isNumber(value)) {
        throw new LoadError(ErrorTypes.utils, `the value for data point ${name} must be a number but ${value} was sent`, null, ErrorCodes.sdk);
      }

      message.sendMessageSync('DataPoint.Add', load.config.user.userId, {
        name,
        value
      });
    },

    base64Encode(value, options) {
      if (isEmpty(value)) {
        throw new LoadError(ErrorTypes.utils, `value must not be empty`, null, ErrorCodes.sdk);
      }
      if (isNil(options)) {
        options = {charset: '', base64URL: false, noPadding: false};
      }
      if (isUndefined(options.charset)) {
        options.charset = '';
      }
      if (!isString(options.charset)) {
        throw new LoadError(ErrorTypes.utils, `the charset for base64Encode must be a string but ${options.charset} was sent`, null, ErrorCodes.sdk);
      }
      const response = message.sendMessageSync('Util.Base64Encode', load.config.user.userId, {
        value: value,
        options: options
      });
      if (response instanceof LoadError) {
        throw response;
      }
      return response.value;
    },

    base64Decode(value, options) {
      if (isEmpty(value)) {
        throw new LoadError(ErrorTypes.utils, `value must not be empty`, null, ErrorCodes.sdk);
      }
      if (isNil(options)) {
        options = {charset: '', base64URL: false, noPadding: false};
      }
      if (isUndefined(options.charset)) {
        options.charset = '';
      }
      if (!isString(options.charset)) {
        throw new LoadError(ErrorTypes.utils, `the charset for base64Decode must be a string but ${options.charset} was sent`, null, ErrorCodes.sdk);
      }
      const response = message.sendMessageSync('Util.Base64Decode', load.config.user.userId, {
        value: value,
        options: options
      });
      if (response instanceof LoadError) {
        throw response;
      }
      if (options.isBinaryContent) {
        response.value = Buffer.from(response.value, 'base64');
      }
      return response.value;
    },

    randomString(size, options) {
      if (!isNumber(size)) {
        throw new LoadError(ErrorTypes.utils, `the size of random string must be a number but ${size} was sent`, null, ErrorCodes.sdk);
      }
      if (isNumber(size) && size < 1) {
        throw new LoadError(ErrorTypes.utils, `the size of random string must be greater than 0`, null, ErrorCodes.sdk);
      }
      let content = {};
      if (!isNil(options) && isObject(options)) {
        if (!isUndefined(options.custom) && isEmpty(options.custom)) {
          throw new LoadError(ErrorTypes.utils, `random string options custom custom character set could not be empty`, null, ErrorCodes.sdk);
        }
        content = {size: size, options: options};
      } else {
        content = {size: size};
      }
      const response = message.sendMessageSync('Util.RandomString', load.config.user.userId, content);
      if (response instanceof LoadError) {
        throw response;
      }
      return response.value;
    },

    hash(algorithm, input, outputEncoding) {
      if (isString(algorithm) && isObject(input)) {
        return this.hash(input.algorithm, algorithm, input.outputEncoding); //This is to support the hash(value, options) API
      }
      if (isUndefined(outputEncoding)) {
        outputEncoding = HashOutputEncoding.base64;
      }
      validateHashArguments(algorithm, input, outputEncoding);
      const response = message.sendMessageSync('Util.Hash', load.config.user.userId, {
        algorithm,
        input,
        outputEncoding
      });
      if (response instanceof LoadError) {
        throw response;
      }
      return response.value;
    },

    hmac(algorithm, secret, input, outputEncoding) {
      if (isString(algorithm) && isObject(secret)) {
        return this.hmac(secret.algorithm, secret.secret, algorithm, secret.outputEncoding); //This is to support the hmac(value, options) API
      }

      if (!isUndefined(secret) && !isString(secret)) {
        throw new LoadError(ErrorTypes.utils, `secret of HMAC must be a string but ${secret} was sent`, null, ErrorCodes.sdk);
      }
      if (isEmpty(secret)) {
        throw new LoadError(ErrorTypes.utils, `secret cannot be empty in hmac`, null, ErrorCodes.sdk);
      }
      if (isUndefined(outputEncoding)) {
        outputEncoding = HashOutputEncoding.base64;
      }
      validateHashArguments(algorithm, input, outputEncoding);
      const response = message.sendMessageSync('Util.Hmac', load.config.user.userId, {
        algorithm: algorithm,
        input: input,
        secret: secret,
        outputEncoding: outputEncoding
      });
      if (response instanceof LoadError) {
        throw response;
      }
      return response.value;
    },

    samlEncode(value) {
      if (isEmpty(value)) {
        throw new LoadError(ErrorTypes.utils, `value must not be empty`, null, ErrorCodes.sdk);
      }
      const response = message.sendMessageSync('Util.SamlEncode', load.config.user.userId, {
        value: value
      });
      if (response instanceof LoadError) {
        throw response;
      }
      return response.value;
    },

    totp(secret, timestamp, options) {
      if (!isString(secret)) {
        throw new LoadError(ErrorTypes.utils, `secret must be a string`, null, ErrorCodes.sdk);
      }
      if (!isNumber(timestamp) || timestamp < 0) {
        throw new LoadError(ErrorTypes.utils, `timestamp must be unix time (UnixMillis)`, null, ErrorCodes.sdk);
      }
      if (isUndefined(options)) { // This is to support the sdk call load.utils.totp(secret, timestamp).
        options = {};
      }
      validateTOTPOptions(options);
      const totpAlgorithm = getTotpAlgorithm(options.algorithm);
      const totpOptions = {
        period: options.period || TotpDefaultOptions.period,
        skew: !isUndefined(options.skew) ? options.skew : TotpDefaultOptions.skew,
        digits: options.digits || TotpDefaultOptions.digits,
        algorithm: totpAlgorithm
      };
      const response = message.sendMessageSync('Util.TOTP', load.config.user.userId, {
        secret: secret,
        timestamp: timestamp,
        totpOptions: totpOptions
      });
      if (response instanceof LoadError) {
        throw response;
      }
      return response.value;
    },

    uuid() {
      const response = message.sendMessageSync('Util.UUID', load.config.user.userId, {});
      if (response instanceof LoadError) {
        throw response;
      }
      return response.value;
    },
    Chain
  };

  return {
    utils,
    HashAlgorithm,
    HashOutputEncoding

  };
};
