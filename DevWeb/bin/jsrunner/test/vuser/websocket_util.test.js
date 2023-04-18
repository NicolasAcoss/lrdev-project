'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const { webSocketStates } = require('./../../vuser/websocket_util.js');
chai.use(sinonChai);

describe('Web socket internal functions', () => {
  let webSocketUtil;
  let messageStub;
  let loadStub;
  let netStub;
  let lifecycle;
  beforeEach(() => {
    loadStub = {

    };

    lifecycle = {
      crashVuserWithError: sinon.stub()
    };

    messageStub = {
      sendMessageSync: sinon.stub(),
      sendMessage: sinon.stub(),
      sendMessageSyncNoResponse: sinon.stub(),
      receiveMessage: sinon.stub()
    };
    netStub = {
      registerSocket: sinon.stub(),
      disconnectSocket: sinon.stub(),
      breakSocketBarrier: sinon.stub(),
      unregisterSocket: sinon.stub()
    };
    webSocketUtil = proxyquire('./../../vuser/websocket_util.js', {
      './message.js': messageStub,
      './core_modules/net.js': netStub,
      './user_lifecycle': lifecycle
    });
  });
  describe('IncomingWebSocketMessageHandler', () => {
    it('should call closeHandler if its a close code', () => {
      const ws = {_readyState: webSocketStates.CLOSING, onMessage: sinon.stub};
      const incomingMessage = {
        messageType: 'WebSocket.ServerSocketClose',
        content: {code: 1005, message: 'normal'}
      };
      webSocketUtil.errorHandler = sinon.stub();
      webSocketUtil.incomingWebSocketMessageHandler(loadStub, ws, incomingMessage);
      expect(ws._readyState).to.be.equal(webSocketStates.CLOSED);
    });
    it('should call break, disconnect and unregister on error', () => {
      const ws = {_readyState: webSocketStates.OPEN, onMessage: sinon.stub(), onError: sinon.stub(), onClose: sinon.stub()};
      const incomingMessage = {
        messageType: 'Error.WebSocket',
        content: {message: 'cannot connect to host', code: 0}
      };
      webSocketUtil.errorHandler = sinon.stub();
      webSocketUtil.incomingWebSocketMessageHandler(loadStub, ws, incomingMessage);
      expect(netStub.breakSocketBarrier).to.have.been.calledOnce;
      expect(netStub.disconnectSocket).to.have.been.calledOnce;
      expect(netStub.unregisterSocket).to.have.been.calledOnce;
      expect(ws._readyState).to.be.equal(webSocketStates.CLOSED);
    });
    it('onMessage called for regular message', () => {
      const ws = { _readyState: webSocketStates.OPEN, onMessage: sinon.stub() };
      const incomingMessage = {
        messageType: 'WebSocket.Message',
        content: { data: 'Boris is the party' }
      };
      webSocketUtil.incomingWebSocketMessageHandler(loadStub, ws, incomingMessage);
      expect(ws.onMessage).to.have.been.called;
      expect(ws._readyState).to.be.equal(webSocketStates.OPEN);
    });

    it('handle error onMessage called for regular message', () => {
      const ws = { _readyState: webSocketStates.OPEN, onMessage: sinon.stub() };
      const incomingMessage = {
        messageType: 'WebSocket.Message',
        content: { data: 'Boris is the party' }
      };
      ws.onMessage = sinon.stub().throws();
      webSocketUtil.incomingWebSocketMessageHandler(loadStub, ws, incomingMessage);
      expect(lifecycle.crashVuserWithError).to.have.been.called;
    });

    it('Should throw on unknown message received', () => {
      const ws = {
        _readyState: webSocketStates.OPEN,
        onMessage: sinon.stub(),
        onError: sinon.stub(),
        onClose: sinon.stub()
      };
      const incomingMessage = {
        messageType: 'WebSocket.RickMessage',
        content: { data: 'Wabba lubba dub dub' }
      };
      webSocketUtil.incomingWebSocketMessageHandler(loadStub, ws, incomingMessage);
      expect(netStub.breakSocketBarrier).to.have.been.calledOnce;
      expect(netStub.disconnectSocket).to.have.been.calledOnce;
      expect(netStub.unregisterSocket).to.have.been.calledOnce;
      expect(ws._readyState).to.be.equal(webSocketStates.CLOSED);
    });
    it('Should ignore message recieved after socket has closed', () => {
      const ws = {
        _readyState: webSocketStates.CLOSED,
        onMessage: sinon.stub(),
        onError: sinon.stub(),
        onClose: sinon.stub(),
        logger: sinon.stub()
      };
      const incomingMessage = {
        messageType: 'WebSocket.Message',
        content: {message: 'Wabba lubba dub dub'}
      };
      webSocketUtil.errorHandler = sinon.stub();
      webSocketUtil.closeHandler = sinon.stub();
      webSocketUtil.incomingWebSocketMessageHandler(loadStub, ws, incomingMessage);
      expect(netStub.breakSocketBarrier).not.to.have.been.called;
      expect(webSocketUtil.errorHandler).not.to.have.been.called;
      expect(webSocketUtil.closeHandler).not.to.have.been.called;
      expect(netStub.disconnectSocket).not.to.have.been.called;
      expect(netStub.unregisterSocket).not.to.have.been.called;
      expect(ws.logger).to.have.been.calledOnce;
      expect(ws._readyState).to.be.equal(webSocketStates.CLOSED);
    });
  });
  describe('ErrorHandler', () => {
    it('should call onError on error if existent', () => {
      const ws = {
        _readyState: webSocketStates.OPEN,
        onError: sinon.stub(),
        onMessage: sinon.stub(),
        onClose: sinon.stub()
      };
      const incomingMessage = {
        messageType: 'Error.WebSocket',
        content: {message: 'internal error', code: 1030}
      };

      netStub.disconnectSocket.callsFake((id, error, cb) => {
        expect(id).to.be.equal(ws.id);
        cb();
      });
      webSocketUtil.incomingWebSocketMessageHandler(loadStub, ws, incomingMessage);
      expect(netStub.breakSocketBarrier).to.have.been.calledOnce;
      expect(netStub.disconnectSocket).to.have.been.calledOnce;
      expect(ws.onError).to.have.been.calledOnce;
      expect(ws.onClose).to.have.been.calledOnce;
      expect(ws._readyState).to.be.equal(webSocketStates.CLOSED);
    });
    it('should handle exception on onError', () => {
      const ws = {
        _readyState: webSocketStates.OPEN,
        onError: sinon.stub().throws()
      };

      netStub.disconnectSocket.callsFake((id, error, cb) => {
        expect(id).to.be.equal(ws.id);
        cb();
      });
      webSocketUtil.incomingWebSocketMessageHandler(loadStub, ws, {});
    });
    it('should handle exception on onClose', () => {
      const ws = {
        _readyState: webSocketStates.OPEN,
        onClose: sinon.stub().throws()
      };

      netStub.disconnectSocket.callsFake((id, error, cb) => {
        expect(id).to.be.equal(ws.id);
        cb();
      });
      webSocketUtil.incomingWebSocketMessageHandler(loadStub, ws, {});
    });

    it('should call only onError on error if existent without disconnecting if connection is not opened', () => {
      const ws = {_readyState: webSocketStates.INIT, onError: sinon.stub(), onMessage: sinon.stub()};
      const incomingMessage = {
        messageType: 'Error.WebSocket',
        content: {message: 'internal error', code: 666}
      };
      webSocketUtil.errorHandler(loadStub, ws, incomingMessage);
      expect(netStub.breakSocketBarrier).not.to.have.been.calledOnce;
      expect(netStub.disconnectSocket).not.to.have.been.calledOnce;
      expect(netStub.unregisterSocket).not.to.have.been.calledOnce;
      expect(ws.onError).to.have.been.called;
      expect(ws._readyState).to.be.equal(webSocketStates.CLOSED);
    });
  });
  describe('closeHandler', () => {
    it('should close socket and call supplied onClose', () => {
      const ws = { _readyState: webSocketStates.OPEN, onClose: sinon.stub() };
      netStub.disconnectSocket.callsFake((id, message, cb) => {
        expect(id).to.be.equal(ws.id);
        cb();
      });
      webSocketUtil.closeHandler(loadStub, ws, '');
      expect(netStub.breakSocketBarrier).to.have.been.calledOnce;
      expect(netStub.disconnectSocket).to.have.been.calledOnce;
      expect(netStub.unregisterSocket).to.have.been.calledOnce;
      expect(ws.onClose).to.have.been.called;
    });
  });
});
