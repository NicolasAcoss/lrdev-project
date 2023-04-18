'use strict';
const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

describe('Script Runner', () => {
  let flowRegistry;
  let scriptRunner;
  beforeEach(() => {
    flowRegistry = {
      getInitializers: sinon.stub(),
      getActions: sinon.stub(),
      getFinalizers: sinon.stub()
    };
    scriptRunner = proxyquire('./../../../vuser/engine/script_runner.js', {
      './flow_registry.js': flowRegistry
    });
  });

  it('should run initialize', (done) => {
    let callCount = 0;
    const initializers = new Map();
    initializers.set('0', () => {
      callCount++;
      return 1;
    });
    initializers.set('1', () => {
      callCount++;
      return Promise.resolve(2);
    });
    flowRegistry.getInitializers.returns(initializers);
    const result = scriptRunner.initialize();
    result.then(() => {
      expect(callCount).to.be.equal(2);
      done();
    });
  });

  it('should run action', (done) => {
    let callCount = 0;
    const actions = new Map();
    actions.set('acton1', () => {
      callCount++;
      return 1;
    });
    actions.set('action2', () => {
      callCount++;
      return Promise.resolve(2);
    });
    flowRegistry.getActions.returns(actions);
    const result = scriptRunner.action();
    result.then(() => {
      expect(callCount).to.be.equal(2);
      done();
    });
  });

  it('should handle run action with empty flow', (done) => {
    const actions = new Map();
    flowRegistry.getActions.returns(actions);
    const result = scriptRunner.action([]);
    result.then((val) => {
      expect(val).to.be.undefined;
      done();
    });
  });

  it('should handle run action with flow', (done) => {
    const actions = new Map();
    let str = '';
    actions.set('action1', () => {
      str += '1';
    });
    actions.set('action2', () => {
      str += '2';
      return 1;
    });
    flowRegistry.getActions.returns(actions);
    const result = scriptRunner.action(['action2', 'action1']);
    result.then(() => {
      expect(str).to.be.equal('21');
      done();
    });
  });

  it('should throw error on run action with corrupted flow', () => {
    const actions = new Map();
    flowRegistry.getActions.returns(actions);
    expect(() => {
      scriptRunner.action([1]);
    }).to.throw('invalid function name: \'1\'');
  });

  it('should run finalize', (done) => {
    let callCount = 0;
    const finalizers = new Map();
    finalizers.set('0', () => {
      callCount++;
      return 1;
    });
    finalizers.set('1', () => {
      callCount++;
      return Promise.resolve(2);
    });
    flowRegistry.getFinalizers.returns(finalizers);
    const result = scriptRunner.finalize();
    result.then(() => {
      expect(callCount).to.be.equal(2);
      done();
    });
  });
});
