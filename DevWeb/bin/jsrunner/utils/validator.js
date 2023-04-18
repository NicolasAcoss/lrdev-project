const {LoadError} = require('../vuser/load_error');
const ErrorCodes = require('../vuser/error_codes');

function isNil(value) {
  return value === null || isUndefined(value);
}

function isFunction(value) {
  return typeof value === 'function';
}

function isArray(value) {
  return Array.isArray(value);
}

function isString(value) {
  return Object.prototype.toString.call(value) === '[object String]';
}

function isBoolean(value) {
  return typeof value === 'boolean' || value instanceof Boolean;
}

function isUndefined(value) {
  return value === undefined;
}

function isInteger(value) {
  return Number.isInteger(value);
}

function isNumber(value) {
  return typeof value === 'number' || value instanceof Number;
}

function isEmpty(value) {
  if (isNil(value)) {
    return true;
  }
  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0;
  }
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }
  return Object.keys(value).length === 0;
}

function isObject(value) {
  return typeof value === 'object' || isFunction(value);
}

function isRegExp(value) {
  return Object.prototype.toString.call(value) === '[object RegExp]';
}

/**
 * validateValuesAreStrings check entry is string and not empty.
 * @param {Object} kwObject object of string keys and string values.
 * @param {String} errorType LoadError
 */
function validateValuesAreStrings(kwObject, errorType) {
  for (const [key, value] of Object.entries(kwObject)) {
    if (!isString(value) || isEmpty(value)) {
      throw new LoadError(errorType, `${key} must be a non empty string`, null, ErrorCodes.sdk);
    }
  }
}

module.exports = {
  isNil,
  isFunction,
  isArray,
  isString,
  isBoolean,
  isUndefined,
  isInteger,
  isNumber,
  isEmpty,
  isObject,
  isRegExp,
  validateValuesAreStrings,
  specific: {}
};