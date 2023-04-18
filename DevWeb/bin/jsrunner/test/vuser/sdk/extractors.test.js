'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const ErrorCodes = require('./../../../vuser/error_codes');

describe('Extractor', () => {
  let load;
  beforeEach(() => {
    const configStub = {
      config: {
        user: {
          userId: 10
        },
        runtime: {
          iteration: 1
        }
      },
      log: sinon.stub()
    };

    load = require('./../../../vuser/sdk/extractors.js')(configStub);
  });

  describe('Boundary based', () => {
    it('should create a boundary based extractor', () => {
      const cr = new load.BoundaryExtractor('Hello', 'Left', 'Right');
      expect(cr.options.leftBoundary).to.be.equal('Left');
      expect(cr.options.rightBoundary).to.be.equal('Right');
    });

    it('should create a boundary with invalid occurrence via object', () => {
      let cr = new load.BoundaryExtractor('Hello', {
        leftBoundary: 'Left',
        rightBoundary: 'Right',
        occurrence: -2
      });
      expect(cr.options.occurrence).to.be.equal(load.ExtractorOccurrenceType.All);
      expect(cr.options.leftBoundary).to.be.equal('Left');
      expect(cr.options.rightBoundary).to.be.equal('Right');
      expect(cr.options.caseInsensitive).to.be.equal(true);

      cr = new load.BoundaryExtractor('Hello', {
        leftBoundary: 'Left',
        rightBoundary: 'Right',
        occurrence: 'aaa',
        scope: 'all',
        caseInsensitive: false
      });
      expect(cr.options.occurrence).to.be.equal(load.ExtractorOccurrenceType.All);
      expect(cr.options.leftBoundary).to.be.equal('Left');
      expect(cr.options.rightBoundary).to.be.equal('Right');
      expect(cr.options.scope).to.be.equal(load.ExtractorScope.All);
      expect(cr.options.caseInsensitive).to.be.equal(false);
    });

    it('should create a boundary with invalid scope via object', () => {
      expect(function() {
        const be = new load.BoundaryExtractor('Hello', {
          leftBoundary: 'Left',
          rightBoundary: 'Right',
          occurrence: 0,
          scope: 'url'
        });
        be.foo = 'bar';
      }).to.throw(`invalid scope 'url'. The valid values are: ${Object.values(load.ExtractorScope).join(', ')}`).with.property('code', ErrorCodes.sdk);
    });

    it('should create a boundary with valid occurrence via object', () => {
      const cr = new load.BoundaryExtractor('Hello', {
        leftBoundary: 'Left',
        rightBoundary: 'Right',
        occurrence: 2
      });
      expect(cr.options.occurrence).to.be.equal('2');
      expect(cr.options.leftBoundary).to.be.equal('Left');
      expect(cr.options.rightBoundary).to.be.equal('Right');
      expect(cr.options.scope).to.be.equal(load.ExtractorScope.All);
    });

    it('should not create a boundary based extractor without a name', () => {
      expect(function() {
        const cr = new load.BoundaryExtractor('', 'Left', 'Right');
        cr.foo = 'bar';
      }).to.throw('cannot create an extractor without a name').with.property('code', ErrorCodes.sdk);
    });
    it('should not create a boundary based extractor with a name as number', () => {
      expect(function() {
        const cr = new load.BoundaryExtractor(123, 'Left', 'Right');
        cr.foo = 'bar';
      }).to.throw('extractor name must be a string').with.property('code', ErrorCodes.sdk);
    });

    it('should not create a boundary based extractor without a any boundary', () => {
      expect(function() {
        const cr = new load.BoundaryExtractor('Foo');
        cr.foo = 'bar';
      }).to.throw('boundary extractor Foo must have at least one boundary defined').with.property('code', ErrorCodes.sdk);
    });
  });

  describe('Regexp based', () => {
    it('should create a regexp based extractor', () => {
      const cr = new load.RegexpExtractor('Hello', 'expression', 'flags');
      expect(cr.options.expression).to.be.equal('expression');
      expect(cr.options.flags).to.be.equal('flags');
      expect(cr.options.groupNumber).to.be.equal(1);
    });

    it('should create a regexp with group number', () => {
      const cr = new load.RegexpExtractor('Hello', {
        expression: 'expression',
        flags: 'flags',
        groupNumber: 3
      });
      expect(cr.options.groupNumber).to.be.equal(3);
    });

    it('should create a regexp with invalid group number', () => {
      const cr = new load.RegexpExtractor('Hello', {
        expression: 'expression',
        flags: 'flags',
        groupNumber: 'foo'
      });
      expect(cr.options.groupNumber).to.be.equal(1);
    });

    it('should create a regexp with invalid scope via object', () => {
      expect(function() {
        const re = new load.RegexpExtractor('Hello', {
          leftBoundary: 'Left',
          rightBoundary: 'Right',
          occurrence: 0,
          scope: 'url'
        });
        re.foo = 'bar';
      }).to.throw(`invalid scope 'url'. The valid values are: ${Object.values(load.ExtractorScope).join(', ')}`).with.property('code', ErrorCodes.sdk);
    });
    it('should create a regexp with invalid occurrence', () => {
      let cr = new load.RegexpExtractor('Hello', {
        expression: 'expression',
        flags: 'flags',
        groupNumber: 0,
        occurrence: -2,
        scope: 'all'
      });
      expect(cr.options.expression).to.be.equal('expression');
      expect(cr.options.flags).to.be.equal('flags');
      expect(cr.options.occurrence).to.be.equal(load.ExtractorOccurrenceType.All);
      expect(cr.options.scope).to.be.equal(load.ExtractorScope.All);

      cr = new load.RegexpExtractor('Hello', {
        expression: 'expression',
        flags: 'flags',
        groupNumber: 0,
        occurrence: 'aaa'
      });
      expect(cr.options.occurrence).to.be.equal(load.ExtractorOccurrenceType.All);
      expect(cr.options.scope).to.be.equal(load.ExtractorScope.All);
    });

    it('should not create a regexp based extractor without a name', () => {
      expect(function() {
        const cr = new load.RegexpExtractor('', 'expression');
        cr.foo = 'bar';
      }).to.throw('cannot create an extractor without a name').with.property('code', ErrorCodes.sdk);
    });

    it('should not create a regexp based extractor without an expression', () => {
      expect(function() {
        const cr = new load.RegexpExtractor('Foo');
        cr.foo = 'bar';
      }).to.throw('expression cannot be empty in regexp extractor Foo').with.property('code', ErrorCodes.sdk);
    });
  });

  describe('JSON path based', () => {
    it('should create a json path based extractor', () => {
      const cr = new load.JsonPathExtractor('Hello', 'path');
      expect(cr.options.path).to.be.equal('path');
    });

    it('should create a json path based extractor from object', () => {
      const cr = new load.JsonPathExtractor('Hello', {path: 'path'});
      expect(cr.options.path).to.be.equal('path');
    });

    it('should not create a JSON based extractor without a name', () => {
      expect(function() {
        const cr = new load.JsonPathExtractor('', 'path');
        cr.foo = 'bar';
      }).to.throw('cannot create an extractor without a name').with.property('code', ErrorCodes.sdk);
    });

    it('should not create a JSON based extractor without an expression', () => {
      expect(function() {
        const cr = new load.JsonPathExtractor('Foo');
        cr.foo = 'bar';
      }).to.throw('path cannot be empty in json path extractor Foo').with.property('code', ErrorCodes.sdk);
    });
  });

  describe('Xpath based', () => {
    it('should create a xpath based extractor', () => {
      const cr = new load.XpathExtractor('Hello', 'path');
      expect(cr.options.path).to.be.equal('path');
    });

    it('should create a xpath based extractor from object', () => {
      const cr = new load.XpathExtractor('Hello', {path: 'path'});
      expect(cr.options.path).to.be.equal('path');
    });

    it('should not create a xpath based extractor without a name', () => {
      expect(function() {
        const cr = new load.XpathExtractor('', 'path');
        cr.foo = 'bar';
      }).to.throw('cannot create an extractor without a name').with.property('code', ErrorCodes.sdk);
    });

    it('should not create a xpath based extractor without a path', () => {
      expect(function() {
        const cr = new load.XpathExtractor('Foo');
        cr.foo = 'bar';
      }).to.throw('path cannot be empty in xpath extractor Foo').with.property('code', ErrorCodes.sdk);
    });
  });

  describe('Text check based', () => {
    it('should create a text check based extractor', () => {
      const cr = new load.TextCheckExtractor('Hello', 'text');
      expect(cr.options.text).to.be.equal('text');
      expect(cr.options.scope).to.be.equal(load.ExtractorScope.Body);
      expect(cr.options.includeRedirections).to.be.equal(true);
    });

    it('should create a text check based extractor from object', () => {
      const cr = new load.TextCheckExtractor('Hello', {text: 'text'});
      expect(cr.options.text).to.be.equal('text');
      expect(cr.options.scope).to.be.equal(load.ExtractorScope.Body);
      expect(cr.options.includeRedirections).to.be.equal(true);
    });

    it('should create a text check based extractor with scope', () => {
      const cr = new load.TextCheckExtractor('Hello', 'text', load.ExtractorScope.All);
      expect(cr.options.text).to.be.equal('text');
      expect(cr.options.scope).to.be.equal(load.ExtractorScope.All);
    });

    it('should not create a text check based extractor without a name', () => {
      expect(function() {
        const cr = new load.TextCheckExtractor('', 'text');
        cr.foo = 'bar';
      }).to.throw('cannot create an extractor without a name').with.property('code', ErrorCodes.sdk);
    });

    it('should not create a text check based extractor without a text', () => {
      expect(function() {
        const cr = new load.TextCheckExtractor('Foo');
        cr.foo = 'bar';
      }).to.throw('text cannot be empty in text check extractor Foo').with.property('code', ErrorCodes.sdk);
    });
  });

  describe('HTML based', () => {
    it('should create an HTML based extractor', () => {
      const cr = new load.HtmlExtractor('Hello', 'foo', 'bar');
      expect(cr.options.querySelector).to.be.equal('foo');
    });

    it('should create a HTML based extractor from object', () => {
      const cr = new load.HtmlExtractor('Hello', {querySelector: 'path', attributeName: 'baz'});
      expect(cr.options.querySelector).to.be.equal('path');
    });

    it('should not create a HTML based extractor without a name', () => {
      expect(function() {
        const cr = new load.HtmlExtractor('', 'path');
        cr.foo = 'bar';
      }).to.throw('cannot create an extractor without a name').with.property('code', ErrorCodes.sdk);
    });

    it('should not create a HTML based extractor without a query', () => {
      expect(function() {
        const cr = new load.HtmlExtractor('Foo');
        cr.foo = 'bar';
      }).to.throw('querySelector cannot be empty in HTML extractor Foo').with.property('code', ErrorCodes.sdk);
    });
  });

  describe('Cookie based', () => {
    it('should create a cookie based extractor', () => {
      const ce = new load.CookieExtractor('Cookie1', 'c1');
      expect(ce.options.cookieName).to.be.equal('c1');
    });

    it('should create a cookie based extractor from object', () => {
      const ce = new load.CookieExtractor('Cookie1', {cookieName: 'c1'});
      expect(ce.options.cookieName).to.be.equal('c1');
    });

    it('should not create a cookie based extractor without a name', () => {
      expect(function() {
        const ce = new load.CookieExtractor('', 'myCookie');
        ce.foo = 'bar';
      }).to.throw('cannot create an extractor without a name').with.property('code', ErrorCodes.sdk);
    });

    it('should not create a cookie based extractor without a cookieName', () => {
      expect(function() {
        const ce = new load.CookieExtractor('Foo');
        ce.foo = 'bar';
      }).to.throw('cookie extractor Foo must have cookie name').with.property('code', ErrorCodes.sdk);
    });
  });

  // describe('Rule based', () => {
  //   it('should create a rule based extractor', () => {
  //     const cr = new load.RuleExtractor('Hello');
  //     expect(cr).to.be.ok;
  //   });
  //
  //   it('should not create a rule based extractor without a name', () => {
  //     expect(function() {
  //       const cr = new load.RuleExtractor('');
  //       cr.foo = 'bar';
  //     }).to.throw('cannot create a extractor without a name');
  //   });
  // });
});
