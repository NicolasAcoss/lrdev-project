'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const {LoadError} = require('./../../../vuser/load_error.js');
const {webSocketStates} = require('./../../../vuser/websocket_util.js');
const ErrorCodes = require('./../../../vuser/error_codes');

chai.use(sinonChai);
describe('Web socket', () => {
  let load;
  let messageStub;
  let configMock;
  let websocketIdCounter = 0;
  let wsInternal;
  let lifecycle;
  let logUtils;

  function createWebSocketId() {
    return `${(websocketIdCounter++).toString()}`;
  }

  let netStub;
  beforeEach(() => {
    websocketIdCounter = 0;
    messageStub = {
      sendMessageSync: sinon.stub(),
      sendMessage: sinon.stub(),
      sendMessageSyncNoResponse: sinon.stub()
    };
    lifecycle = {
      crashVuserWithError: sinon.stub()
    };
    configMock = {
      config: {
        user: {
          userId: 1
        },
        stage: 'initialize'
      },
      log: sinon.stub(),
      exit: sinon.stub(),
      LogLevel: {
        error: 'error'
      },
      ExitType: {
        iteration: 'iteration',
        stop: 'stop',
        abort: 'abort'
      }
    };
    netStub = {
      newSocketBarrier: sinon.stub(),
      registerSocket: sinon.stub(),
      disconnectSocket: sinon.stub(),
      breakSocketBarrier: sinon.stub(),
      unregisterSocket: sinon.stub(),
      waitForSocketClosure: sinon.stub()
    };
    wsInternal = {
      errorHandler: sinon.stub(),
      incomingWebSocketMessageHandler: sinon.stub(),
      closeHandler: sinon.stub()
      //'@global': true
    };
    logUtils = {internalLog: sinon.stub(), LogLevel: sinon.stub()};

    const logUtilsStub = function() {
      return logUtils;
    };
    load = proxyquire('./../../../vuser/sdk/web_socket.js', {
      './../message.js': messageStub,
      './../core_modules/net.js': netStub,
      './../websocket_util.js': wsInternal,
      './../user_lifecycle.js': lifecycle,
      './../utils/log_utils.js': logUtilsStub
    })(configMock);
  });
  describe('constructor', () => {
    it('should create a websocket with a options URL with a callback and proper id', () => {
      const onMessage = function(wsMessage) {
        return `${wsMessage}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage
      });

      // webSocket.onMessage(onMessage);
      expect(webSocket.url).to.be.equal('ws://wsTest.zmeyIsGod.com');
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.INIT);
    });
    it('should error when there is no URL in options', () => {
      const badConstructor = function() { return new load.WebSocket({}); };
      expect(badConstructor).to.throw(Error, 'WebSocket options must have a "url" property').with.property('code', ErrorCodes.sdk);
    });
    it('should error when there is no onMessage in options', () => {
      const badConstructor = function() { return new load.WebSocket({url: 'ws://test.com'}); };
      expect(badConstructor).to.throw(Error, 'WebSocket options.onMessage must be a function but undefined was sent').with.property('code', ErrorCodes.sdk);
    });
    it('should error when onDisconnect isn`t a function', () => {
      const badConstructor = function() {
        return new load.WebSocket({
          url: 'ws://test.com',
          onMessage: () => {},
          onClose: 'borisCheck'
        });
      };
      expect(badConstructor).to.throw(Error, 'WebSocket options.onClose must be a function but borisCheck was sent').with.property('code', ErrorCodes.sdk);
    });
    it('should error when onError isn`t a function', () => {
      const badConstructor = function() {
        return new load.WebSocket({
          url: 'ws://test.com',
          onMessage: () => {},
          onError: 'borisCheck'
        });
      };
      expect(badConstructor).to.throw(Error, 'WebSocket options.onError must be a function but borisCheck was sent').with.property('code', ErrorCodes.sdk);
    });
    it('should error when onConnect isn`t a function', () => {
      const badConstructor = function() {
        return new load.WebSocket({
          url: 'ws://test.com',
          onMessage: () => {},
          onOpen: 'borisCheck'
        });
      };
      expect(badConstructor).to.throw(Error, 'WebSocket options.onOpen must be a function but borisCheck was sent').with.property('code', ErrorCodes.sdk);
    });
  });
  describe('connecting', () => {
    it(`should fail connecting since websocket isn't open and throw error`, () => {
      messageStub.sendMessageSync.returns(
        new LoadError('WebSocket', 'cannot connect to host', {message: 'cannot connect to host'})
      );
      wsInternal.errorHandler.callsFake((loadObj, ws) => {
        ws._readyState = webSocketStates.CLOSED;
      });
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: sinon.stub(),
        onError: sinon.stub()
      });
      const badWebSocketConnect = function() { return webSocket.open(); };
      expect(badWebSocketConnect).to.throw('cannot connect to host');
      expect(wsInternal.errorHandler).to.have.been.calledOnce;
      expect(webSocket._readyState).to.be.equal(webSocketStates.CLOSED);
    });
    it('should succeed connecting and change state', () => {
      messageStub.sendMessageSync.returns(
        {content: ''}
      );
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage
      });
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.INIT);
      webSocket.open();
      expect(webSocket.id).to.be.equal(createWebSocketId());
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.OPEN);
    });
    it('should succeed connecting and not be put on limited to action queue', () => {
      messageStub.sendMessageSync.returns(
        {content: ''}
      );
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage
      });
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.INIT);
      webSocket.open();
      expect(webSocket.id).to.be.equal(createWebSocketId());
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.OPEN);
      expect(webSocket._isOpenedInInitStage).to.be.equal(true);
    });
    it('should succeed connecting and be in queue', () => {
      configMock.config.stage = 'action';
      messageStub.sendMessageSync.returns(
        {content: ''}
      );
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage
      });
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.INIT);
      webSocket.open();
      expect(webSocket.id).to.be.equal(createWebSocketId());
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.OPEN);
      expect(webSocket._isOpenedInInitStage).to.be.equal(false);
    });
    it('should succeed connecting, change state and call user onConnect callback', () => {
      messageStub.sendMessageSync.returns(
        {content: ''}
      );
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage,
        onOpen: sinon.stub()
      });
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.INIT);
      webSocket.open();
      expect(webSocket.onOpen).to.have.been.called;
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.OPEN);
    });

    it('should crash vuser when exception occurs in websocket onOpen event', () => {
      messageStub.sendMessageSync.returns(
        {content: ''}
      );
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage,
        onOpen: sinon.stub().throws()
      });
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.INIT);
      webSocket.open();
      expect(lifecycle.crashVuserWithError).to.have.been.called;
      expect(webSocket._readyState).to.be.equal(webSocketStates.OPEN);
    });
  });
  describe(`closing`, () => {
    it(`should fail closing due to received error`, () => {
      messageStub.sendMessageSync.returns('');
      // wsInternal.closeHandler.returns();
      // wsInternal.errorHandler.throws(new LoadError('WebSocket', 'error during closure of websocket', {msg: ''}));
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: sinon.stub(),
        onError: sinon.stub()
      });
      webSocket.open();
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.OPEN);
      messageStub.sendMessageSync.reset();
      messageStub.sendMessageSync.returns(new LoadError('WebSocket', 'error during closure of websocket', {message: ''}, 1));
      expect(() => {
        webSocket.close();
      }).to.throw('error during closure of websocket').with.property('code', 1);
    });
    it(`should fail closing since websocket hasn't been open due to received error`, () => {
      messageStub.sendMessageSync.returns('');
      // wsInternal.closeHandler.returns();
      // wsInternal.errorHandler.throws(new LoadError('WebSocket', 'error during closure of websocket', {msg: ''}));
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: sinon.stub(),
        onError: sinon.stub()
      });
      expect(webSocket._getConnectionStatus()).not.to.be.equal(webSocketStates.OPEN);
      expect(() => {
        webSocket.close();
      }).to.throw('Trying to close websocket [undefined] that hasn\'t been opened yet');
    });
    it(`should close the websocket`, () => {
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: sinon.stub()
      });
      webSocket.open();
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.OPEN);
      webSocket.close();
      expect(messageStub.sendMessageSync).to.have.been.called;
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.CLOSING);
    });
  });
  describe(`send`, () => {
    it(`should fail sending message `, () => {
      messageStub.sendMessageSync.returns(
        {content: ``}
      );
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: sinon.stub()
      });
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.INIT);
      const dataToSend = 'testMySanity';
      expect(() => {
        webSocket.send(dataToSend);
      }).to.throw(`WebSocket [Id: ${webSocket.id}] has not been open, message: [${dataToSend}] will not be sent`).with.property('code', ErrorCodes.sdk_logic);
    });
    it(`should fail sending message since the socket is closed `, () => {
      messageStub.sendMessageSync.returns(
        {content: ``}
      );
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: sinon.stub()
      });
      webSocket.open();
      webSocket._readyState = webSocketStates.CLOSED;
      const dataToSend = 'testMySanity';
      expect(() => {
        webSocket.send(dataToSend);
      }).to.throw(`WebSocket [Id: ${webSocket.id}] already closed, message: [${dataToSend}] will not be sent`).with.property('code', ErrorCodes.sdk_logic);
    });
    it(`should send the message`, () => {
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: sinon.stub()
      });
      webSocket.open();
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.OPEN);
      webSocket.send(`testingMySanity`);
      expect(messageStub.sendMessageSyncNoResponse).to.have.been.called;
    });
    it(`should send the message from file`, () => {
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: sinon.stub()
      });
      webSocket.open();
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.OPEN);
      webSocket.send({dataPath: '.\\package.json'});
      expect(messageStub.sendMessageSyncNoResponse).to.have.been.called;
    });
    it(`should fail sending an empty message`, () => {
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: sinon.stub()
      });
      webSocket.open();
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.OPEN);

      expect(() => {
        webSocket.send();
      }).to.throw('WebSocket send must have data or dataPath defined').with.property('code', ErrorCodes.sdk);
    });
    it(`should send a binary message`, () => {
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: sinon.stub()
      });
      webSocket.open();
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.OPEN);
      webSocket.send(Buffer.from(`testingMySanity`));
      expect(messageStub.sendMessageSyncNoResponse).to.have.been.called;
      const messagData = messageStub.sendMessageSyncNoResponse.getCall(0).args[2];
      expect(messagData.isBinaryData).to.be.true;
    });
    it(`should send a binary message with two arguments`, () => {
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: sinon.stub()
      });
      webSocket.open();
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.OPEN);
      webSocket.send(`testingMySanity`, true);
      expect(messageStub.sendMessageSyncNoResponse).to.have.been.called;
      const messagData = messageStub.sendMessageSyncNoResponse.getCall(0).args[2];
      expect(messagData.isBinary).to.be.true;
    });
  });
  describe(`user blocking`, () => {
    it(`should block vuser till websocket is disconnected`, (done) => {
      messageStub.sendMessageSync.returns(
        {content: ''}
      );
      let promiseResolve;
      const socketPromise = new Promise((resolve) => {
        promiseResolve = resolve;
      });
      netStub.waitForSocketClosure.returns(Promise.resolve());
      netStub.registerSocket.returns(socketPromise);
      netStub.disconnectSocket.returns(promiseResolve);
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage
      });
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.INIT);
      webSocket.open();
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.OPEN);
      expect(webSocket.waitForClose().then(done())).to.be.a('promise').not.to.be.fulfilled;
      webSocket.close();
      expect(messageStub.sendMessageSync).to.have.been.called;
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.CLOSED);
    });
    it(`should block vuser till websocket is disconnected and the promise is fulfilled with disconnection`, (done) => {
      messageStub.sendMessageSync.returns(
        {content: ''}
      );
      let promiseResolve;
      const socketPromise = new Promise((resolve) => {
        promiseResolve = resolve;
      });
      netStub.registerSocket.returns(socketPromise);
      netStub.disconnectSocket.returns(promiseResolve);
      netStub.waitForSocketClosure.returns(Promise.resolve());
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGood.com',
        onMessage: onMessage
      });
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.INIT);
      webSocket.open();
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.OPEN);
      expect(webSocket.waitForClose().then(done())).to.be.a('promise').not.to.be.fulfilled;
      webSocket.close();
      expect(messageStub.sendMessageSync).to.have.been.called;
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.CLOSED);
      (netStub.disconnectSocket())();
    });
  });
  describe(`waitForClose`, () => {
    it(`should wait for connection to end`, (done) => {
      netStub.waitForSocketClosure.returns(Promise.resolve());
      netStub.registerSocket.returns(Promise.resolve());
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: `ws://wsTest.zmeyIsGod.com`,
        onMessage
      });

      webSocket.open();
      expect(webSocket._readyState).to.be.equal(webSocketStates.OPEN);
      webSocket.waitForClose().then(() => {
        expect(webSocket.logger).to.have.been.called;
        done();
      }).catch((err) => {
        done(err);
      });
    });
    it(`should fail if socket was not connected yet`, () => {
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage
      });

      netStub.registerSocket.returns(Promise.resolve());
      expect(() => {
        webSocket.waitForClose();
      }).to.throw(`WebSocket [Id: ${webSocket.id}] has not been open yet, socket.open() need to be called before calling waitForClose.`).with.property('code', ErrorCodes.sdk_logic);
    });
    it('should reach timeout of wait on websocket closure', (done) => {
      netStub.waitForSocketClosure.returns(Promise.resolve());
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: sinon.stub(),
        onError: sinon.stub(),
        onClose: sinon.stub()
      });
      webSocket.open();
      webSocket.close = sinon.stub();
      webSocket.waitForClose(10)
        .then(() => {
          // let closeMessage = JSON.parse('{"id":"WS_0","isClosedByClient":true,"code":1006,"reason":"waitForClose timeout expired"}');
          expect(webSocket.onClose).to.have.been.calledOnce;
          expect(webSocket.close).to.have.been.calledOnce;
          expect(webSocket._readyState).to.be.equal(webSocketStates.CLOSED);
          expect(netStub.unregisterSocket).to.have.been.calledOnce;
          done();
        }).catch((err) => {
          done(new Error(`Expected wait for close not to reject and throw error: ${err}`));
        });
    });
    it('should get error reject websocket closure', (done) => {
      netStub.waitForSocketClosure.returns(Promise.reject(new Error('Oh no!')));
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: sinon.stub(),
        onError: sinon.stub(),
        onClose: sinon.stub()
      });
      webSocket.open();
      webSocket.waitForClose(10).then(() => {
        done(new Error('Expected method to throw and reject.'));
      },
      () => {
        expect(webSocket.logger).to.have.been.calledOnce;
        expect(webSocket.onClose).to.have.been.calledOnce;
        expect(webSocket.onError).to.have.been.calledOnce;
        expect(netStub.unregisterSocket).to.have.been.calledOnce;
        done();
      }).catch(done);
    });
  });
  describe('continue', () => {
    it('should fail to release barrier on continue since socket is not open', () => {
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage
      });
      expect(webSocket._getConnectionStatus()).to.be.equal(webSocketStates.INIT);
      webSocket.continue();
      expect(netStub.breakSocketBarrier).not.to.have.been.called;
    });
    it('should fail to release barrier on continue since socket is not open', () => {
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage
      });
      webSocket.open();
      webSocket._readyState = webSocketStates.CLOSED;
      webSocket.continue();
      expect(netStub.breakSocketBarrier).not.to.have.been.called;
      expect(wsInternal.errorHandler).to.have.been.called;
    });
    it('should release barrier on continue', () => {
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage
      });
      webSocket.open();
      webSocket.continue();
      expect(netStub.breakSocketBarrier).to.have.been.called;
    });
  });
  describe('waitForData', () => {
    it(`should fail if socket was not connected yet`, () => {
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage
      });

      netStub.registerSocket.returns(Promise.resolve());
      expect(() => {
        webSocket.waitForData();
      }).to.throw(`WebSocket [Id: ${webSocket.id}] has not been open yet, socket.open() need to be called before calling waitForData.`).with.property('code', ErrorCodes.sdk_logic);
    });
    it(`should fail if socket is already closed`, (done) => {
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage
      });

      netStub.registerSocket.returns(Promise.resolve());

      webSocket.open();
      webSocket.close();
      webSocket.waitForData().then(() => {
        done(new Error('Expected method to reject.'));
      }).catch((err) => {
        chai.assert.isDefined(err);
        done();
      }).catch(done);
    });
    it('should successfully wait on websocket barrier', (done) => {
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      netStub.newSocketBarrier.returns(Promise.resolve());
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage
      });
      webSocket.open();
      webSocket.waitForData(10).then(() => {
        expect(webSocket.logger).to.have.been.called;
        done();
      });
    });
    it('should reach timeout of wait on websocket barrier', (done) => {
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      /*eslint prefer-promise-reject-errors: ["error", {"allowEmptyReject": true}]*/
      netStub.newSocketBarrier.returns(Promise.reject());
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage
      });
      webSocket.open();
      webSocket.waitForData(10).then(() => {
        expect(webSocket.logger).to.have.been.called;
        done();
      }).catch(() => {
        expect(webSocket.logger).to.have.been.called;
        done();
      });
    });
    it('should reject wait for data due to error', (done) => {
      const onMessage = function(message) {
        return `${message}Eureka`;
      };
      netStub.newSocketBarrier.returns(Promise.reject(new Error('Oh no!')));
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: onMessage
      });
      webSocket.open();
      webSocket.waitForData(10).then(() => {
        expect(webSocket.logger).to.have.been.called;
        done();
      }).catch(() => {
        expect(webSocket.logger).to.have.been.called;
        done();
      });
    });
    it('reject waitForData due to disconnect during awaiting', (done) => {
      const webSocket = new load.WebSocket({
        url: 'ws://wsTest.zmeyIsGod.com',
        onMessage: sinon.stub(),
        onError: sinon.stub(),
        onClose: sinon.stub(),
        logger: sinon.stub()
      });
      netStub.newSocketBarrier.callsFake(() => {
        webSocket._readyState = webSocketStates.CLOSING;
        return Promise.resolve();
      });
      webSocket.open();
      const errMessage = `WebSocket [Id: ${webSocket.id}] has been closed during waitForData`;

      webSocket.waitForData(10).then(() => {
      }).catch((err) => {
        expect(err.message).to.be.equal(errMessage);
        done();
      });
    });
  });
});
