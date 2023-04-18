'use strict';

//This runs in the execution thread!
let relay;

module.exports = {
  init(externalRelay) {
    relay = externalRelay;
  },
  net: {
    clearPendingResponseMessages: function() {
      return relay.clearResponsePendingMessages();
    },
    sendSync: function(messageId, payload) {
      return relay.sendSync(messageId, payload);
    },
    send: function(messageId, payload, callback) {
      return relay.send(messageId, payload, callback);
    },
    sendSyncNoWait: function(messageId, payload) {
      return relay.sendSyncNoWait(messageId, payload);
    }
  },
  socket: {
    registerSocket: function(websocketId, onMessageFunc) {
      return relay.registerSocket(websocketId, onMessageFunc);
    },
    unregisterSocket: function(websocketId) {
      return relay.unregisterSocket(websocketId);
    },
    disconnectSocket: function(websocketId, error, callback) {
      return relay.disconnectSocket(websocketId, error, callback);
    },
    newSocketBarrier: function(websocketId, timeout) {
      return relay.newSocketBarrier(websocketId, timeout);
    },
    breakSocketBarrier: function(websocketId, errorMessage) {
      return relay.breakSocketBarrier(websocketId, errorMessage);
    },
    waitForSocketClosure: function(websocketId, timeout) {
      return relay.waitForSocketClosure(websocketId, timeout);
    },
    clearAllSockets: function() {
      return relay.clearAllSockets();
    }
  },
  timers: {
    setTimeout: function(callback, timerDelay) {
      return relay.setTimeout(callback, timerDelay);
    },
    setInterval: function(callback, timerDelay) {
      return relay.setInterval(callback, timerDelay);
    },
    clearTimer: function(id) {
      return relay.clearTimer(id);
    },
    clearAllTimers: function() {
      return relay.clearAllTimers();
    },
    waitForTimer: function(id) {
      return relay.waitForTimer(id);
    }
  },
  clear() {
    this.socket.clearAllSockets();
    this.net.clearPendingResponseMessages();
    this.timers.clearAllTimers();
  }
};
