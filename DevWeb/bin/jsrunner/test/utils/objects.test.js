'use strict';

const chai = require('chai');
const {startsWith, cloneDeep, defaultsDeep} = require('./../../utils/objects.js');
const expect = chai.expect;

describe('objects', () => {
  describe('startsWith', () => {
    const string = 'abc';
    it('should handle startWith with starting position', () => {
      expect(startsWith('a', '')).to.be.true;
      expect(startsWith('a', 'a')).to.be.true;
      expect(startsWith('a', 'a', 0)).to.be.true;
      expect(startsWith('abc', 'abc')).to.be.true;
      expect(startsWith('abc', 'bc', 1)).to.be.true;
      expect(startsWith('abc', 'bc', 0)).to.be.false;
      expect(startsWith('abc', 'bc', 2)).to.be.false;
      expect(startsWith(undefined, 'a')).to.be.false;
      expect(startsWith()).to.be.false;
      expect(startsWith(12, 'a')).to.be.false;
      expect(startsWith([], 'a')).to.be.false;
    });
    it('should return `true` if a string starts with `target`', function() {
      expect(startsWith(string, 'a')).to.be.true;
    });

    it('should return `false` if a string does not start with `target`', function() {
      expect(startsWith(string, 'b')).to.be.false;
    });

    it('should work with a `position`', function() {
      expect(startsWith(string, 'b', 1)).to.be.true;
    });

    it('should work with `position` >= `length`', function() {
      [3, 5, Number.MAX_SAFE_INTEGER, Infinity].forEach(position => {
        expect(startsWith(string, 'a', position)).to.be.false;
      });
    });

    it('should treat a negative `position` as `0`', function() {
      [-1, -3, -Infinity].forEach(position => {
        expect(startsWith(string, 'a', position)).to.be.true;
        expect(startsWith(string, 'b', position)).to.be.false;
      });
    });

    it('should coerce `position` to an integer', function() {
      expect(startsWith(string, 'bc', 1.2)).to.be.true;
    });
  });

  describe('cloneObject', () => {
    it('should clone object correctly using cloneDeep', () => {
      const object = {
        r: {
          e: [1, 2, 3],
          f: new Date(),
          g: Buffer.from('ABC')
        },
        foo() { return 1; }
      };
      const clonedObject = cloneDeep(object);
      expect(cloneDeep(object)).to.eql(clonedObject);
      expect(object === clonedObject).to.be.false;
      expect(object.r.e).to.eql(clonedObject.r.e);
      expect(object.r.e === clonedObject.r.e).to.be.false;
      expect(Buffer.isBuffer(clonedObject.r.g));
      expect(clonedObject.r.g === object.r.g).to.be.false;
      object.r.e = [1];
      expect(clonedObject.r.e).to.eql([1, 2, 3]);
      expect(cloneDeep({a: {b: {c: {d: {e: 1}}}}})).to.eql({a: {b: {c: {d: {e: 1}}}}});
      expect(cloneDeep({a: {b: {c: {d: {e: 1}}}}})).to.not.eql({a: {b: {c: {d: {e: 0}}}}});
    });

    it('should handle clone buffers', () => {
      const buffer = Buffer.from('ABC');
      expect(cloneDeep(buffer)).to.eql(buffer);
    });

    it('should handle clone array with objects by value', () => {
      const object = {
        a: {aa: 'a'}
      };
      const arr = [1, 2, object];
      const cloned = cloneDeep(arr);
      expect(cloned).to.be.eql(arr);
      object.a.aa = 'b';
      expect(cloned).to.be.not.eql(arr);
    });

    it('should handle clone map/array/date objects', () => {
      const map = new Map();
      const set = new Set();
      const date = new Date();
      map.set(1, 1).set(2, 2);
      set.add(1).add(2);
      const object = {
        map, set, date
      };
      expect(cloneDeep(object)).to.eql({map, set, date});
    });

    it('should handle circular reference', () => {
      const obj = {a: {aa: 1}, b: {bb: 2}};
      obj.a.aa = obj.b;
      expect(cloneDeep(obj).a.aa).to.eql(obj.b);
    });
  });

  describe('should handle defaultsDeep', () => {
    it('should deep assign source properties if missing on `object`', () => {
      const object = { a: { b: 2 }, d: 4 };
      const source = { a: { b: 3, c: 3 }, e: 5 };
      const expected = { a: { b: 2, c: 3 }, d: 4, e: 5 };

      expect(defaultsDeep(object, source)).to.eql(expected);
    });

    it('should accept multiple sources', () => {
      const source1 = { a: { b: 3 } };
      const source2 = { a: { c: 3 } };
      const source3 = { a: { b: 3, c: 3 } };
      const source4 = { a: { c: 4 } };
      const expected = { a: { b: 2, c: 3 } };
      expect(defaultsDeep({ a: { b: 2 } }, source1, source2)).to.eql(expected);
      expect(defaultsDeep({ a: { b: 2 } }, source3, source4)).to.eql(expected);
    });

    it('should not overwrite `null` values', () => {
      const object = { a: { b: null } };
      const source = { a: { b: 2 } };
      const actual = defaultsDeep(object, source);

      expect(actual.a.b).to.equal(null);
    });

    it('should not overwrite regexp values', () => {
      const object = { a: { b: /x/ } };
      const source = { a: { b: /y/ } };
      const actual = defaultsDeep(object, source);
      expect(actual.a.b).to.eql(/x/);
    });

    it('should overwrite `undefined` values', () => {
      const object = { a: { b: undefined } };
      const source = { a: { b: 2 } };
      const actual = defaultsDeep(object, source);
      expect(actual.a.b).to.equal(2);
    });

    it('should assign `undefined` values', () => {
      const source = { a: undefined, b: { c: undefined, d: 1 } };
      const expected = cloneDeep(source);
      const actual = defaultsDeep({}, source);
      expect(actual).to.eql(expected);
    });

    it('should not modify sources', () => {
      const source1 = { a: 1, b: { c: 2 } };
      const source2 = { b: { c: 3, d: 3 } };
      const actual = defaultsDeep({}, source1, source2);

      expect(actual).to.eql({ a: 1, b: { c: 2, d: 3 } });
      expect(source1).to.eql({ a: 1, b: { c: 2 } });
      expect(source2).to.eql({ b: { c: 3, d: 3 } });
    });

    it('should not attempt a merge of a string into an array', () => {
      const actual = defaultsDeep({ a: ['abc'] }, { a: 'abc' });
      expect(actual.a).to.eql(['abc']);
    });

    it('should extend array and not replace it', () => {
      const object = {
        a: [1]
      };
      const arr = [function() {}];
      const source = {
        a: [7, 8, arr]
      };
      const actual = defaultsDeep(object, source);
      expect(actual.a).to.eql([1, 8, arr]);
    });

    it('should copy array by value', () => {
      const object = [0];
      const a = {b: 1};
      const source = [1, a];
      expect(defaultsDeep(object, source)).to.eql([0, a]);
      a.b = 2;
      expect(defaultsDeep(object, source)).to.not.eql([0, a]);
    });

    it('should handle circular reference', () => {
      const object = {
        foo: {b: {c: {d: {}}}},
        bar: {a: 2}
      };

      const source = {
        foo: { b: { c: { d: {} } } },
        bar: {}
      };

      object.foo.b.c.d = object;
      source.foo.b.c.d = source;
      source.bar.b = source.foo.b;
      const actual = defaultsDeep(object, source);
      expect(actual.bar.b).to.eql(actual.foo.b);
      expect(actual.foo.b.c.d).to.eql(actual.foo.b.c.d.foo.b.c.d);
    });
  });
});
