'use strict';
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
let registry;
describe('Flow Registry', () => {
  beforeEach(() => {
    registry = proxyquire('./../../../vuser/engine/flow_registry.js', {});
  });

  it('should register and get an initializer', () => {
    const foo = () => {
    };
    registry.addInitializer(foo);
    const result = registry.getInitializers();
    expect(result.size).to.be.equal(1);
    const entries = result.entries();
    const iteratorResult = entries.next();
    expect(iteratorResult.value[1]).to.be.equal(foo);
  });

  it('should return a readonly copy of the initializers', () => {
    registry.addInitializer(() => {
    });
    const result = registry.getInitializers();
    result.set('1', () => {
    });
    const result2 = registry.getInitializers();
    expect(result2.size).to.be.equal(1);
  });

  it('should register and get a finalizer', () => {
    const foo = () => {
    };
    registry.addFinalizer('myFoo1', foo);
    const result = registry.getFinalizers();
    expect(result.size).to.be.equal(1);
    const entries = result.entries();
    const iteratorResult = entries.next();
    expect(iteratorResult.value[1]).to.be.equal(foo);
  });

  it('should return a readonly copy of the finalizers', () => {
    registry.addFinalizer(() => {
    });
    const result = registry.getFinalizers();
    result.set('1', () => {
    });
    const result2 = registry.getFinalizers();
    expect(result2.size).to.be.equal(1);
  });

  it('should register and get an action', () => {
    const foo = () => {
    };
    registry.addAction('Cow', foo);
    const result = registry.getActions();
    expect(result.size).to.be.equal(1);
    const entries = result.entries();
    const iteratorResult = entries.next();
    expect(iteratorResult.value[0]).to.be.equal('Cow');
    expect(iteratorResult.value[1]).to.be.equal(foo);
  });

  it('should return a readonly copy of the finalizers', () => {
    registry.addAction('Cow', () => {
    });
    const result = registry.getActions();
    result.set('milk', () => {
    });
    const result2 = registry.getActions();
    expect(result2.size).to.be.equal(1);
  });
});
