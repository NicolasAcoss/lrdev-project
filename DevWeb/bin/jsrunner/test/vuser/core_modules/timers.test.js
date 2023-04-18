const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const expect = chai.expect;
chai.use(sinonChai);
const ErrorCodes = require('./../../../vuser/error_codes');

describe('net', () => {
  let timers;

  const nativeFacade = {
    timers: {
      setTimeout: sinon.stub(),
      setInterval: sinon.stub(),
      clearTimer: sinon.stub(),
      waitForTimer: sinon.stub(),
      clearAllTimers: sinon.stub()
    }
  };
  beforeEach(() => {
    timers = proxyquire('./../../../vuser/core_modules/timers.js', {
      './../../bogatyr/internal/facade.js': nativeFacade
    });
  });

  describe('clearTimer', () => {
    it('Should fail to use timer clearTimer due to bad arguments', () => {
      expect(() => {
        timers.clearTimer('1');
      }).to.throw(`clearTimer requires to pass id (unsigned integer) but it received [1]`).with.property('code', ErrorCodes.script);
    });
    it('Should handle call to clearTimer', () => {
      timers.clearTimer(1);
      expect(nativeFacade.timers.clearTimer).to.have.been.called;
    });
  });

  describe('waitForTimer', () => {
    it('Should fail to use timer waitForTimer due to bad arguments', () => {
      expect(() => {
        timers.waitForTimer('1');
      }).to.throw(`Bad argument passed to waitForTimer: Please pass id (unsigned integer)`).with.property('code', ErrorCodes.script);
    });
    it('Should handle call to waitForTimer', () => {
      timers.waitForTimer(1);
      expect(nativeFacade.timers.waitForTimer).to.have.been.called;
    });
  });
  describe('increase coverage', () => {
    it('should call timers functions successfully', () => {
      timers._setTimeout();
      timers._setInterval();
      expect(nativeFacade.timers.setTimeout).to.have.been.called;
      expect(nativeFacade.timers.setInterval).to.have.been.called;
    });
  });
});
