'use strict';
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

const {
  isString,
  isEmpty,
  isUndefined,
  isInteger,
  isBoolean,
  isObject,
  isNil,
  isNumber,
  specific
} = require('./../../utils/validator.js');

specific.isExtractor = function(value) {
  return (value instanceof ExtractorBase);
};

class ExtractorBase {
  constructor(name, type) {
    if (!isString(name)) {
      throw new LoadError(ErrorTypes.extractors, 'extractor name must be a string', null, ErrorCodes.sdk);
    }
    if (isEmpty(name)) {
      throw new LoadError(ErrorTypes.extractors, 'cannot create an extractor without a name', null, ErrorCodes.sdk);
    }

    this.type = type;
    this.name = name;
  }
}

module.exports = function(load) {
  const ExtractorOccurrenceType = {
    First: 'first',
    Last: 'last',
    All: 'all'
  };

  const ExtractorScope = {
    Body: 'body',
    Headers: 'headers',
    All: 'all'
  };

  class BoundaryExtractor extends ExtractorBase {
    constructor(name, leftBoundary, rightBoundary) {
      super(name, 'boundary');

      let options = {
        leftBoundary,
        rightBoundary
      };

      if (isObject(leftBoundary) && isUndefined(rightBoundary)) {
        options = leftBoundary;
      }

      if (isEmpty(options.leftBoundary) && isEmpty(options.rightBoundary)) {
        throw new LoadError(ErrorTypes.extractors, `boundary extractor ${name} must have at least one boundary defined`, null, ErrorCodes.sdk);
      }
      if (isUndefined(options.includeRedirections) || !isBoolean(options.includeRedirections)) {
        options.includeRedirections = true;
      }
      if (isUndefined(options.caseInsensitive)) {
        options.caseInsensitive = true;
      }
      if (isUndefined(options.occurrence)) {
        options.occurrence = ExtractorOccurrenceType.First;
      }
      if (!isNumber(options.occurrence) && (!Object.values(ExtractorOccurrenceType).includes(options.occurrence))) {
        options.occurrence = ExtractorOccurrenceType.All;
      }
      if (isNumber(options.occurrence) && options.occurrence < 0) {
        options.occurrence = ExtractorOccurrenceType.All;
      }
      options.occurrence = String(options.occurrence);
      if (isUndefined(options.scope) || isEmpty(options.scope)) {
        options.scope = ExtractorScope.All;
      }
      if (!Object.values(ExtractorScope).includes(options.scope)) {
        throw new LoadError(ErrorTypes.extractors, `invalid scope '${options.scope}'. The valid values are: ${Object.values(ExtractorScope).join(', ')}`, null, ErrorCodes.sdk);
      }

      this.options = options;
    }
  }

  class RegexpExtractor extends ExtractorBase {
    constructor(name, expression, flags) {
      super(name, 'regexp');

      let options = {
        expression,
        flags
      };
      if (isObject(expression) && isUndefined(flags)) {
        options = expression;
      }

      if (isEmpty(expression)) {
        throw new LoadError(ErrorTypes.extractors, `expression cannot be empty in regexp extractor ${name}`, null, ErrorCodes.sdk);
      }
      if (isNil(options.groupNumber)) {
        options.groupNumber = 1;
      }
      if (!isInteger(options.groupNumber) || options.groupNumber < 0) {
        options.groupNumber = 1;
      }
      if (isUndefined(options.includeRedirections) || !isBoolean(options.includeRedirections)) {
        options.includeRedirections = true;
      }
      if (isUndefined(options.occurrence)) {
        options.occurrence = ExtractorOccurrenceType.First;
      }
      if (!isNumber(options.occurrence) && (!Object.values(ExtractorOccurrenceType).includes(options.occurrence))) {
        options.occurrence = ExtractorOccurrenceType.All;
      }
      if (isNumber(options.occurrence) && options.occurrence < 0) {
        options.occurrence = ExtractorOccurrenceType.All;
      }
      options.occurrence = String(options.occurrence);
      if (isUndefined(options.scope) || isEmpty(options.scope)) {
        options.scope = ExtractorScope.All;
      }
      if (!Object.values(ExtractorScope).includes(options.scope)) {
        throw new LoadError(ErrorTypes.extractors, `invalid scope '${options.scope}'. The valid values are: ${Object.values(ExtractorScope).join(', ')}`, null, ErrorCodes.sdk);
      }
      this.options = options;
    }
  }

  class JsonPathExtractor extends ExtractorBase {
    constructor(name, path, returnMultipleValues) {
      super(name, 'json');

      let options = {
        path,
        returnMultipleValues
      };

      if (isObject(path) && isUndefined(returnMultipleValues)) {
        options = path;
      }

      if (isEmpty(options.path)) {
        throw new LoadError(ErrorTypes.extractors, `path cannot be empty in json path extractor ${name}`, null, ErrorCodes.sdk);
      }

      if (!isBoolean(options.returnMultipleValues)) {
        options.returnMultipleValues = false;
      }

      this.options = options;
    }
  }

  class XpathExtractor extends ExtractorBase {
    constructor(name, path, returnMultipleValues) {
      super(name, 'xpath');
      let options = {
        path,
        returnMultipleValues
      };

      if (isObject(path) && isUndefined(returnMultipleValues)) {
        options = path;
      }

      if (isEmpty(options.path)) {
        throw new LoadError(ErrorTypes.extractors, `path cannot be empty in xpath extractor ${name}`, null, ErrorCodes.sdk);
      }

      if (!isBoolean(options.returnMultipleValues)) {
        options.returnMultipleValues = false;
      }

      this.options = options;
    }
  }

  class TextCheckExtractor extends ExtractorBase {
    constructor(name, text, scope) {
      super(name, 'textCheck');
      let options = {
        text,
        scope
      };

      if (isObject(text) && isUndefined(scope)) {
        options = text;
      }

      if (isEmpty(options.text)) {
        throw new LoadError(ErrorTypes.extractors, `text cannot be empty in text check extractor ${name}`, null, ErrorCodes.sdk);
      }

      if (isEmpty(options.scope)) {
        options.scope = ExtractorScope.Body;
      }

      if (isUndefined(options.includeRedirections) || !isBoolean(options.includeRedirections)) {
        options.includeRedirections = true;
      }

      this.options = options;
    }
  }

  class HtmlExtractor extends ExtractorBase {
    constructor(name, querySelector, attributeName) {
      super(name, 'html');
      let options = {
        querySelector: querySelector,
        attributeName
      };
      if (isObject(querySelector) && isUndefined(attributeName)) {
        options = querySelector;
      }

      if (isEmpty(options.querySelector)) {
        throw new LoadError(ErrorTypes.extractors, `querySelector cannot be empty in HTML extractor ${name}`, null, ErrorCodes.sdk);
      }

      this.options = options;
    }
  }

  class CookieExtractor extends ExtractorBase {
    constructor(name, cookieName, domain, path) {
      super(name, 'cookie');

      let options = {
        cookieName,
        domain,
        path
      };

      if (isObject(cookieName) && isUndefined(domain) && isUndefined(path)) {
        options = cookieName;
      }

      if (isEmpty(options.cookieName)) {
        throw new LoadError(ErrorTypes.extractors, `cookie extractor ${name} must have cookie name`, null, ErrorCodes.sdk);
      }
      if (isUndefined(options.includeRedirections) || !isBoolean(options.includeRedirections)) {
        options.includeRedirections = true;
      }

      if (isUndefined(options.includeRedirections) || !isBoolean(options.includeRedirections)) {
        options.includeRedirections = true;
      }
      if (isUndefined(options.occurrence)) {
        options.occurrence = ExtractorOccurrenceType.First;
      }
      if (!isNumber(options.occurrence) && (!Object.values(ExtractorOccurrenceType).includes(options.occurrence))) {
        options.occurrence = ExtractorOccurrenceType.All;
      }
      if (isNumber(options.occurrence) && options.occurrence < 0) {
        options.occurrence = ExtractorOccurrenceType.All;
      }
      options.occurrence = String(options.occurrence);

      this.options = options;
    }
  }

  return {
    extractors: {},
    BoundaryExtractor,
    RegexpExtractor,
    JsonPathExtractor,
    XpathExtractor,
    TextCheckExtractor,
    HtmlExtractor,
    CookieExtractor,
    ExtractorOccurrenceType,
    ExtractorScope
  };
};
