'use strict';

const chai = require('chai');
const expect = chai.expect;
const {
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
  isRegExp
} = require('./../../utils/validator.js');

describe('validator', () => {
  it('validate isNil', () => {
    expect(isNil(null)).to.be.true;
    expect(isNil()).to.be.true;
    expect(isNil(undefined)).to.be.true;
    expect(isNil([1, 2, 3])).to.be.false;
    expect(isNil(true)).to.be.false;
    expect(isNil(new Date())).to.be.false;
    expect(isNil(new Error())).to.be.false;
    expect(isNil({a: 1})).to.be.false;
    expect(isNil(1)).to.be.false;
    expect(isNil(/x/)).to.be.false;
    expect(isNil('a')).to.be.false;
    expect(isNil(false)).to.be.false;
    expect(isNil(0)).to.be.false;
    expect(isNil('')).to.be.false;
  });

  it('validate isFunction', () => {
    expect(isFunction(function() {})).to.be.true;
    expect(isFunction(async function() {})).to.be.true;
    expect(isFunction(() => {})).to.be.true;
    expect(isFunction(async() => {})).to.be.true;
    const a = function() {};
    expect(isFunction(a)).to.be.true;
    expect(isFunction(Promise)).to.be.true;
    expect(isFunction(Proxy)).to.be.true;
    expect(isFunction(Map)).to.be.true;

    expect(isFunction([1, 2, 3])).to.be.false;
    expect(isFunction(true)).to.be.false;
    expect(isFunction(new Date())).to.be.false;
    expect(isFunction(new Error())).to.be.false;
    expect(isFunction({a: 1})).to.be.false;
    expect(isFunction(1)).to.be.false;
    expect(isFunction(/x/)).to.be.false;
    expect(isFunction('a')).to.be.false;
  });

  it('validate isArray', () => {
    expect(isArray([])).to.be.true;
    expect(isArray([1])).to.be.true;
    expect(isArray(new Array([]))).to.be.true;
    expect(isArray(new Map())).to.be.false;
    expect(isArray(new Set())).to.be.false;

    expect(isArray(true)).to.be.false;
    expect(isArray(new Date())).to.be.false;
    expect(isArray(new Error())).to.be.false;
    expect(isArray({0: 1, length: 1})).to.be.false;
    expect(isArray(1)).to.be.false;
    expect(isArray(/x/)).to.be.false;
    expect(isArray('a')).to.be.false;
  });

  it('validate isString', () => {
    expect(isString('')).to.be.true;
    expect(isString('a')).to.be.true;
    expect(isString(String('a'))).to.be.true;

    expect(isString([1, 2, 3])).to.be.false;
    expect(isString(true)).to.be.false;
    expect(isString(new Date())).to.be.false;
    expect(isString(new Error())).to.be.false;
    expect(isString({0: 1, length: 1})).to.be.false;
    expect(isString(1)).to.be.false;
    expect(isString(/x/)).to.be.false;
  });

  it('validate isBoolean', () => {
    expect(isBoolean(true)).to.be.true;
    expect(isBoolean(false)).to.be.true;

    expect(isBoolean(Object(true))).to.be.true;
    expect(isBoolean(Object(false))).to.be.true;
    expect(isBoolean(0)).to.be.false;
    expect(isBoolean('')).to.be.false;
  });

  it('validate isUndefined', () => {
    expect(isUndefined(undefined)).to.be.true;
    expect(isUndefined()).to.be.true;
    expect(isUndefined(0)).to.be.false;
    expect(isUndefined('')).to.be.false;
  });

  it('validate isInteger', () => {
    expect(isInteger(0)).to.be.true;
    expect(isInteger(1)).to.be.true;
    expect(isInteger(Number.MAX_SAFE_INTEGER)).to.be.true;
    expect(isInteger(Number.MIN_SAFE_INTEGER)).to.be.true;

    expect(isInteger(Object(1))).to.be.false;
    expect(isInteger(1.5)).to.be.false;
    expect(isInteger(Math.PI)).to.be.false;
    expect(isInteger(Infinity)).to.be.false;
    expect(isInteger(-Infinity)).to.be.false;
    expect(isInteger([1, 2, 3])).to.be.false;
  });

  it('validate isNumber', () => {
    expect(isNumber(5)).to.be.true;
    expect(isNumber(Object(2))).to.be.true;
    expect(isNumber('5')).to.be.false;
    expect(isNumber([1, 2, 3])).to.be.false;
    expect(isNumber(true)).to.be.false;
    expect(isNumber(false)).to.be.false;
    expect(isNumber(null)).to.be.false;
    expect(isNumber(undefined)).to.be.false;
    expect(isNumber(new Date())).to.be.false;
    expect(isNumber(new Error())).to.be.false;
    expect(isNumber()).to.be.false;
    expect(isNumber({a: 1})).to.be.false;
    expect(isNumber(/x/)).to.be.false;
    expect(isNumber('a')).to.be.false;
  });

  it('validate isEmpty', () => {
    expect(isEmpty(true)).to.be.true;
    expect(isEmpty(false)).to.be.true;
    expect(isEmpty(undefined)).to.be.true;
    expect(isEmpty(0)).to.be.true;
    expect(isEmpty(1)).to.be.true;
    expect(isEmpty(NaN)).to.be.true;
    expect(isEmpty(Infinity)).to.be.true;
    expect(isEmpty([])).to.be.true;
    expect(isEmpty(/x/)).to.be.true;
    expect(isEmpty()).to.be.true;
    // set
    const set = new Set();
    expect(isEmpty(set)).to.be.true;
    set.add(1);
    expect(isEmpty(set)).to.be.false;
    set.delete(1);
    // map
    const map = new Map();
    expect(isEmpty(map)).to.be.true;
    map.set('a', 1);
    expect(isEmpty(map)).to.be.false;
    map.delete('a');
    expect(isEmpty(map)).to.be.true;
  });
  it('validate isObject', () => {
    const foo = () => {};
    expect(isObject([1, 2, 3])).to.be.true;
    expect(isObject(Object(false))).to.be.true;
    expect(isObject(new Date())).to.be.true;
    expect(isObject(new Error())).to.be.true;
    expect(isObject({a: 1})).to.be.true;
    expect(isObject(Object(0))).to.be.true;
    expect(isObject(Object('a'))).to.be.true;
    expect(isObject(/x/)).to.be.true;
    expect(isObject({})).to.be.true;
    expect(isObject(new Map())).to.be.true;
    expect(isObject(new Set())).to.be.true;
    expect(isObject(foo)).to.be.true;
    // eslint-disable-next-line prefer-regex-literals
    expect(isObject(new RegExp('a'))).to.be.true;
  });

  it('validate isRegExp', () => {
    // eslint-disable-next-line prefer-regex-literals
    expect(isRegExp(new RegExp('a'))).to.be.true;
    expect(isRegExp(/x/)).to.be.true;
    expect(isRegExp([1, 2, 3])).to.be.false;
    expect(isRegExp(Object(false))).to.be.false;
    expect(isRegExp(new Date())).to.be.false;
    expect(isRegExp(new Error())).to.be.false;
    expect(isRegExp({a: 1})).to.be.false;
    expect(isRegExp(Object(0))).to.be.false;
    expect(isRegExp(Object('a'))).to.be.false;
    expect(isRegExp({})).to.be.false;
    expect(isRegExp(new Map())).to.be.false;
    expect(isRegExp(new Set())).to.be.false;
  });
});
