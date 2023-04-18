'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const ErrorCodes = require('./../../../vuser/error_codes');

let flow;
let flowRegistry;

describe('Flow Control', () => {
  beforeEach(() => {
    flowRegistry = {
      addInitializer: sinon.stub(),
      addFinalizer: sinon.stub(),
      addAction: sinon.stub()
    };

    flow = proxyquire('./../../../vuser/sdk/flow_control.js', {
      './../engine/flow_registry.js': flowRegistry
    })();
  });

  describe('Initializers', () => {
    it('should add an initializer', () => {
      flow.initialize(() => {
      });

      expect(flowRegistry.addInitializer).to.have.been.calledOnce;
    });

    it('should not add anything if no valid callback is sent', () => {
      expect(() => {
        flow.initialize('this is invalid');
      }).to.throw('initialize must be called with a callback function - initialize(\'initialize name\', function(){})').with.property('code', ErrorCodes.sdk);
    });
  });

  describe('Finalizers', () => {
    it('should add an finalizer', () => {
      flow.finalize(() => {
      });

      expect(flowRegistry.addFinalizer).to.have.been.calledOnce;
    });

    it('should not add anything if no valid callback is sent', () => {
      expect(() => {
        flow.finalize('this is invalid');
      }).to.throw('finalize must be called with a callback function - finalize(\'finalize name\', function(){})').with.property('code', ErrorCodes.sdk);
    });
  });

  describe('Actions', () => {
    it('should add an action', () => {
      flow.action('foo', () => {
      });

      expect(flowRegistry.addAction).to.have.been.calledOnce;
    });

    it('should not add anything if no action name is sent', () => {
      expect(() => {
        flow.action(() => {
        });
      }).not.to.throw(`An action must be called with a callback function' but got 'action must be called with a callback function - action('action name', function(){}) or action(function(){})`);
    });

    it('should not add anything if no action callback is sent', () => {
      expect(() => {
        flow.action('action name');
      }).not.to.throw(`An action must be called with a callback function' but got 'action must be called with a callback function - action('action name', function(){}) or action(function(){})`);
    });
  });
});
