'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const ErrorCodes = require('./../../../vuser/error_codes');

chai.use(sinonChai);
describe('timers', () => {
  let timers;
  let lifecycle;
  let load = {};
  let configMock = {};
  beforeEach(() => {
    configMock = {
      config: {
        user: {
          userId: 1
        },
        stage: 'initialize'
      },
      log: sinon.stub(),
      LogLevel: {
        error: 'error'
      }
    };
    timers = {
      _setInterval: sinon.stub(),
      _setTimeout: sinon.stub(),
      clearTimer: sinon.stub(),
      waitForTimer: sinon.stub()
    };
    lifecycle = {
      crashVuserWithError: sinon.stub()
    };
    load = proxyquire('./../../../vuser/sdk/timers.js', {
      './../core_modules/timers.js': timers,
      './../user_lifecycle.js': lifecycle
    })(configMock);
    configMock.Timer = load.Timer;
  });
  describe('constructor', () => {
    it('should create a timer', () => {
      const callback = () => { };
      const timer = new load.Timer(callback, 6000);
      expect(timer._id).to.be.equal(-1);
      expect(timer._delay).to.be.equal(6000);
      expect(timer._callback).not.to.be.undefined;
    });
    it('should error when there is no callback in the constructor', () => {
      const badConstructor = function() { return new load.Timer(6000); };
      expect(badConstructor).to.throw(Error, 'Timer callback must be set and must be a function').with.property('code', ErrorCodes.sdk);
    });
    it('should error when there is no onMessage in options', () => {
      const badConstructor = function() { return new load.Timer(() => {}); };
      expect(badConstructor).to.throw(Error, 'Timer delay must be set and must be a positive integer').with.property('code', ErrorCodes.sdk);
    });
  });
  describe('stop', () => {
    it('stop should fail since the timer had not been started', function() {
      const badTimer = new load.Timer(() => {}, 6000);
      expect(() => {
        badTimer.stop();
      }).to.throw('Cannot stop a timer that has not been started').with.property('code', ErrorCodes.sdk_logic);
    });
    it('stop should fail since the timer was already stopped', function() {
      timers._setTimeout.returns(1);
      const badTimer = new load.Timer(() => {}, 6000);
      badTimer.startTimeout();
      expect(() => {
        badTimer.stop();
        badTimer.stop();
      }).to.throw('Cannot stop a timer that has not been started').with.property('code', ErrorCodes.sdk_logic);
    });
    it('interval timer stop should fail since the timer was started in different stage', function() {
      const badTimer = new load.Timer(() => {}, 6000);
      badTimer.startInterval();
      configMock.config.stage = 'action';
      expect(() => {
        badTimer.stop();
      }).to.throw('as');

      const badTimer2 = new load.Timer(() => {}, 6000);
      configMock.config.stage = 'action';
      badTimer2.startInterval();
      configMock.config.stage = 'finalize';
      expect(() => {
        badTimer2.stop();
      }).to.throw('The timer undefined has been started in action stage and and therefore cannot be stopped in the finalize stage').with.property('code', ErrorCodes.sdk_logic);
    });
    it('timeout timer stop should fail since the timer was started in different stage', function() {
      const badTimer = new load.Timer(() => {}, 6000);
      badTimer.startTimeout();
      configMock.config.stage = 'action';
      expect(() => {
        badTimer.stop();
      }).to.throw('The timer undefined has been started in initialize stage and and therefore cannot be stopped in the action stage').with.property('code', ErrorCodes.sdk_logic);

      const badTimer2 = new load.Timer(() => {}, 6000);
      configMock.config.stage = 'action';
      badTimer2.startTimeout();
      configMock.config.stage = 'finalize';
      expect(() => {
        badTimer2.stop();
      }).to.throw('The timer undefined has been started in action stage and and therefore cannot be stopped in the finalize stage').with.property('code', ErrorCodes.sdk_logic);
    });
  });
  describe('wait', () => {
    it('wait should fail since the timer had not been started', function() {
      const badTimer = new load.Timer(() => {}, 6000);
      expect(() => {
        badTimer.wait();
      }).to.throw('Cannot wait on a timer that has not been started').with.property('code', ErrorCodes.sdk_logic);
    });
    it('interval timer wait should fail since the timer was started in different stage', function() {
      const badTimer = new load.Timer(() => {}, 6000);
      badTimer.startInterval();
      configMock.config.stage = 'action';
      expect(() => {
        badTimer.wait();
      }).to.throw('The timer undefined has been started in initialize stage and and therefore cannot be waited on in the action stage').with.property('code', ErrorCodes.sdk_logic);

      const badTimer2 = new load.Timer(() => {}, 6000);
      configMock.config.stage = 'action';
      badTimer2.startInterval();
      configMock.config.stage = 'finalize';
      expect(() => {
        badTimer2.wait();
      }).to.throw('The timer undefined has been started in action stage and and therefore cannot be waited on in the finalize stage').with.property('code', ErrorCodes.sdk_logic);
    });
    it('timeout timer wait should fail since the timer was started in different stage', function() {
      const badTimer = new load.Timer(() => {}, 6000);
      badTimer.startTimeout();
      configMock.config.stage = 'action';
      expect(() => {
        badTimer.wait();
      }).to.throw('The timer undefined has been started in initialize stage and and therefore cannot be waited on in the action stage').with.property('code', ErrorCodes.sdk_logic);

      const badTimer2 = new load.Timer(() => {}, 6000);
      configMock.config.stage = 'action';
      badTimer2.startTimeout();
      configMock.config.stage = 'finalize';
      expect(() => {
        badTimer2.wait();
      }).to.throw('The timer undefined has been started in action stage and and therefore cannot be waited on in the finalize stage').with.property('code', ErrorCodes.sdk_logic);
    });
    it('wait should call waitForTimer', function() {
      const timer = new load.Timer(() => {}, 6000);
      timer.startInterval();
      timer.wait();
      expect(timers.waitForTimer).to.be.called;
    });
  });
  describe('setInterval', () => {
    it('should fail since the timer had not been started', function() {
      const badTimer = new load.Timer(() => {}, 6000);
      expect(() => {
        badTimer.stop();
      }).to.throw('Cannot stop a timer that has not been started').with.property('code', ErrorCodes.sdk_logic);
    });
    it('should fail since the timer was already stopped', function() {
      timers._setInterval.returns(1);
      const badTimer = new load.Timer(() => {}, 6000);
      badTimer.startInterval();
      expect(() => {
        badTimer.stop();
        badTimer.stop();
      }).to.throw('Cannot stop a timer that has not been started').with.property('code', ErrorCodes.sdk_logic);
    });
    it('should error if a timer has been started twice', () => {
      expect(() => {
        const timer = new load.Timer(() => {}, 6000);
        timers._setInterval.returns(1);
        timer.startInterval();
        timer.startInterval();
      }).to.throw(`The timer 1 has already been started.`).with.property('code', ErrorCodes.sdk_logic);
    });
  });
  describe('setTimeout', () => {
    it('should fail since the timer had not been started', function() {
      const badTimer = new load.Timer(() => {}, 6000);
      expect(() => {
        badTimer.stop();
      }).to.throw('Cannot stop a timer that has not been started').with.property('code', ErrorCodes.sdk_logic);
    });
    it('should fail since the timer was already stopped', function() {
      timers._setTimeout.returns(1);
      const badTimer = new load.Timer(() => {}, 6000);
      badTimer.startTimeout();
      expect(() => {
        badTimer.stop();
        badTimer.stop();
      }).to.throw('Cannot stop a timer that has not been started').with.property('code', ErrorCodes.sdk_logic);
    });
    it('should error if a timer has been started twice', () => {
      const timer = new load.Timer(() => {}, 6000);
      timers._setTimeout.returns(1);
      expect(() => {
        timer.startTimeout();
        timer.startTimeout();
      }).to.throw(`The timer 1 has already been started.`).with.property('code', ErrorCodes.sdk_logic);
    });
  });
});
