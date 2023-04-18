'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(sinonChai);
const facade = require('./../../../bogatyr/internal/facade');
describe('facade', () => {
  const relay = {
    clearResponsePendingMessages: sinon.stub(),
    sendSync: sinon.stub(),
    send: sinon.stub(),
    sendSyncNoWait: sinon.stub(),
    registerSocket: sinon.stub(),
    unregisterSocket: sinon.stub(),
    disconnectSocket: sinon.stub(),
    newSocketBarrier: sinon.stub(),
    breakSocketBarrier: sinon.stub(),
    waitForSocketClosure: sinon.stub(),
    clearAllSockets: sinon.stub(),
    setTimeout: sinon.stub(),
    setInterval: sinon.stub(),
    clearTimer: sinon.stub(),
    clearAllTimers: sinon.stub(),
    waitForTimer: sinon.stub()
  };

  beforeEach(() => {
    facade.init(relay);
  });

  describe('net', () => {
    const net = facade.net;
    it('handle clearPendingResponseMessages', () => {
      net.clearPendingResponseMessages();
      expect(relay.clearResponsePendingMessages).to.have.been.called;
    });
    it('handle sendSync', () => {
      net.sendSync();
      expect(relay.sendSync).to.have.been.called;
    });
    it('handle clearPendingResponseMessages', () => {
      net.send();
      expect(relay.send).to.have.been.called;
    });
    it('handle sendSyncNoWait', () => {
      net.sendSyncNoWait();
      expect(relay.sendSyncNoWait).to.have.been.called;
    });
  });

  describe('socket', () => {
    const socket = facade.socket;
    it('handle registerSocket', () => {
      socket.registerSocket();
      expect(relay.registerSocket).to.have.been.called;
    });
    it('handle unregisterSocket', () => {
      socket.unregisterSocket();
      expect(relay.unregisterSocket).to.have.been.called;
    });
    it('handle disconnectSocket', () => {
      socket.disconnectSocket();
      expect(relay.disconnectSocket).to.have.been.called;
    });
    it('handle newSocketBarrier', () => {
      socket.newSocketBarrier();
      expect(relay.newSocketBarrier).to.have.been.called;
    });
    it('handle breakSocketBarrier', () => {
      socket.breakSocketBarrier();
      expect(relay.breakSocketBarrier).to.have.been.called;
    });
    it('handle waitForSocketClosure', () => {
      socket.waitForSocketClosure();
      expect(relay.waitForSocketClosure).to.have.been.called;
    });
    it('handle clearAllSockets', () => {
      socket.clearAllSockets();
      expect(relay.clearAllSockets).to.have.been.called;
    });
  });
  describe('timers', () => {
    const timers = facade.timers;
    it('handle setTimeout', () => {
      timers.setTimeout();
      expect(relay.setTimeout).to.have.been.called;
    });
    it('handle setInterval', () => {
      timers.setInterval();
      expect(relay.setInterval).to.have.been.called;
    });
    it('handle clearTimer', () => {
      timers.clearTimer();
      expect(relay.clearTimer).to.have.been.called;
    });
    it('handle clearAllTimers', () => {
      timers.clearAllTimers();
      expect(relay.clearAllTimers).to.have.been.called;
    });
    it('handle waitForTimer', () => {
      timers.waitForTimer();
      expect(relay.waitForTimer).to.have.been.called;
    });
  });
});
