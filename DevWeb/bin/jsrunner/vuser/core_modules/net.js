'use strict';
const {isString, isFunction, isInteger} = require('./../../utils/validator.js');
const native = require('./../../bogatyr/internal/facade.js');
const {error} = require('./net_messages');
//Definitions of functions in order to support testing

function sendSync(messageId, payload) {
  if (
    !isInteger(messageId) ||
    !isString(payload)) {
    throw new Error(error.sendSyncArgument);
  }
  if (payload.length === 0) {
    throw new Error(error.sendSyncEmptyPayload);
  }

  return native.net.sendSync(messageId, payload);
}

function send(messageId, payload, callback) {
  if (!isInteger(messageId) ||
    !isString(payload) ||
    !isFunction(callback)) {
    throw new Error(error.sendArgument);
  }
  return native.net.send(messageId, payload, callback);
}

function sendSyncNoWait(messageId, payload) {
  if (!isInteger(messageId) ||
    !isString(payload)) {
    throw new Error(error.sendSyncNoWaitArgument);
  }
  if (payload.length === 0) {
    throw new Error(error.sendSyncNoWaitEmptyPayload);
  }
  return native.net.sendSyncNoWait(messageId, payload);
}

function registerSocket(socketId, onMessageHandler) {
  if (!isString(socketId) || !isFunction(onMessageHandler)) {
    throw new Error(error.registerSocketArgument);
  }
  return native.socket.registerSocket(socketId, onMessageHandler);
}

function unregisterSocket(socketId) {
  if (!isString(socketId)) {
    throw new Error(error.unRegisterBareSocketArgument);
  }
  return native.socket.unregisterSocket(socketId);
}

function disconnectSocket(socketId, message, callback) {
  if (!isString(socketId)) { //TODO: add validation
    throw new Error(error.unRegisterBareSocketArgument);
  }
  return native.socket.disconnectSocket(socketId, message, callback);
}

function newSocketBarrier(socketId, timeout) {
  if (!isString(socketId) ||
    !isInteger(timeout)) {
    throw new Error(error.newSocketBarrierArgument);
  }
  return native.socket.newSocketBarrier(socketId, timeout);
}

function waitForSocketClosure(socketId, timeout) {
  if (!isString(socketId) ||
    !isInteger(timeout)) {
    throw new Error(`Bad argument passed to waitForWebSocketBarrier - Please pass socketId (string) & timeout (Integer). Passed arguments: [SocketId: ${socketId}, Timeout: ${timeout}]`);
  }
  return native.socket.waitForSocketClosure(socketId, timeout);
}

function breakSocketBarrier(socketId, errorMessage) {
  if (!isString(socketId)) {
    throw new Error(error.breakSocketBarrierArgument);
  }
  return native.socket.breakSocketBarrier(socketId, errorMessage);
}

module.exports = {
  sendSync,
  send,
  sendSyncNoWait,
  registerSocket,
  unregisterSocket,
  newSocketBarrier,
  disconnectSocket,
  breakSocketBarrier,
  waitForSocketClosure
};
