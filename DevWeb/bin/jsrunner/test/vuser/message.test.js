'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

describe('message', () => {
  let message;
  let send;

  beforeEach(() => {
    send = {
      send: sinon.stub(),
      sendSync: sinon.stub(),
      sendSyncNoWait: sinon.stub()
    };

    message = proxyquire('./../../vuser/message', {
      './core_modules/net.js': send
    });
  });
  describe('Send Sync', () => {
    it('should not send an empty message content', () => {
      message.sendMessageRaw('A', undefined, '', true);
      const sentMessage = send.sendSync.getCall(0);
      expect(sentMessage).to.be.null;
    });

    it('should send a message raw', () => {
      message.sendMessageRaw('A', 'B', 'C', true, true);
      let sentMessage = send.sendSync.getCall(0).args[1];
      expect(sentMessage).not.to.be.undefined;
      sentMessage = JSON.parse(sentMessage);
      expect(sentMessage.messageType).to.be.equal('A');
      expect(sentMessage.id).to.be.equal('B');
      expect(sentMessage.content).to.be.equal('C');
    });

    it('should read a message', () => {
      message.sendMessageRaw('A', 'B', 'C', true, false);
      const sentMessage = send.sendSyncNoWait.getCall(0).args[1];
      const parsedSentMessage = JSON.parse(sentMessage);
      const result = message.receiveMessage(parsedSentMessage);
      expect(result).to.be.equal('C');
    });

    it('should send and read a message', () => {
      send.sendSync.returns({
        content: 'AAA'
      });

      const result = message.sendMessageSync('A', 'B', 'C');
      expect(result).to.be.equal('AAA');
    });

    it('should generate a custom error if an error type message was received', () => {
      const result = message.receiveMessage({
        messageType: 'Error.MyError',
        content: 'Foo!'
      });
      expect(result).to.be.an('error');
      expect(result.type).to.be.equal('MyError');
      expect(result.content).to.be.equal('Foo!');
    });
  });

  describe('Send Sync No Response', () => {
    it('should send a message without waiting for response', () => {
      message.sendMessageSyncNoResponse('A', 'B', 'C');
      expect(send.sendSyncNoWait).to.have.been.calledOnce;
    });
  });

  describe('Send Async', () => {
    it('should send a message raw', (done) => {
      message.sendMessageRaw('A', 'B', 'C', false).then(() => {
        let sentMessage = send.send.getCall(0).args[1];
        expect(sentMessage).not.to.be.undefined;
        sentMessage = JSON.parse(sentMessage);
        expect(sentMessage.messageType).to.be.equal('A');
        expect(sentMessage.id).to.be.equal('B');
        expect(sentMessage.content).to.be.equal('C');
        done();
      });
      const fn = send.send.getCall(0).args[2];
      fn('AA');
    });

    it('should read a message', (done) => {
      message.sendMessageRaw('A', 'B', 'C', false).then(() => {
        const sentMessage = send.send.getCall(0).args[1];
        const parsedSentMessage = JSON.parse(sentMessage);
        const result = message.receiveMessage(parsedSentMessage);
        expect(result).to.be.equal('C');
        done();
      });
      const fn = send.send.getCall(0).args[2];
      fn('AA');
    });

    it('should send and read a message', (done) => {
      message.sendMessage('A', 'B', 'C').then((result) => {
        expect(result).to.be.equal('AAA');
        done();
      });

      const fn = send.send.getCall(0).args[2];
      fn({ content: 'AAA' });
    });
  });

  describe('Receive message', () => {
    it('should throw if message of type fatal error', () => {
      expect(() => {
        message.receiveMessage({
          messageType: 'FatalError.MyError',
          content: 'Foo!'
        });
      }).to.throw('Foo!');
    });
  });
});