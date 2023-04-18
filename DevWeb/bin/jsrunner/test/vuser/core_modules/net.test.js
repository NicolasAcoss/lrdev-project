const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const expect = chai.expect;
chai.use(sinonChai);

const {error} = require('./../../../vuser/core_modules/net_messages');

describe('net', () => {
  let net;
  const nativeFacade = {
    net: {
      send: sinon.stub(),
      sendSync: sinon.stub(),
      sendSyncNoWait: sinon.stub(),
      clearPendingResponseMessages: sinon.stub()
    },
    socket: {
      registerSocket: sinon.stub(),
      unregisterSocket: sinon.stub(),
      clearAllSockets: sinon.stub(),
      disconnectSocket: sinon.stub(),
      newSocketBarrier: sinon.stub(),
      breakSocketBarrier: sinon.stub(),
      waitForSocketClosure: sinon.stub()
    }
  };
  beforeEach(() => {
    net = proxyquire('./../../../vuser/core_modules/net.js', {
      './../../bogatyr/internal/facade.js': nativeFacade
    });
  });

  describe('SendSyncNoWait', () => {
    it('Should fail sendSyncNoWait component due to bad arguments', () => {
      expect(() => {
        net.sendSyncNoWait();
      }).to.throw(error.sendSyncNoWaitArgument);
      expect(() => {
        net.sendSyncNoWait(8080, function() {});
      }).to.throw(error.sendSyncNoWaitArgument);
      expect(() => {
        net.sendSyncNoWait(1, '');
      }).to.throw(error.sendSyncNoWaitEmptyPayload);
    });

    it('Should sendSyncNoWait', () => {
      expect(() => {
        net.sendSyncNoWait(1, 'AA');
      }).not.to.throw();
    });
  });

  describe('Send', () => {
    it('Should fail Send component due to bad arguments', () => {
      expect(() => {
        net.send();
      }).to.throw(error.sendArgument);
      expect(() => {
        net.send('');
      }).to.throw(error.sendArgument);
      expect(() => {
        net.send(88, 99, function() {});
      }).to.throw(error.sendArgument);
      expect(() => {
        net.send(88, 'ff', {});
      }).to.throw(error.sendArgument);
    });

    it('Should send', () => {
      expect(() => {
        net.send(10, 'ff', () => {});
      }).to.not.throw();
    });
  });

  describe('SendSync', () => {
    it('Should fail SendSync component due to bad arguments', () => {
      expect(() => {
        net.sendSync();
      }).to.throw(error.sendSyncArgument);
      expect(() => {
        net.sendSync(8080);
      }).to.throw(error.sendSyncArgument);
      expect(() => {
        net.sendSync(1, '');
      }).to.throw(error.sendSyncEmptyPayload);
    });

    it('Should SendSync', () => {
      expect(() => {
        net.sendSync(1, 'a');
      }).to.not.throw();
    });
  });

  describe('RegisterSocket', () => {
    it('should fail to register socket due to bad arguments', () => {
      expect(() => {
        net.registerSocket();
      }).throw(error.registerSocketArgument);
      expect(() => {
        net.registerSocket(8080);
      }).throw(error.registerSocketArgument);
      expect(() => {
        net.registerSocket(1, '');
      }).throw(error.registerSocketArgument);
    });

    it('should register socket', () => {
      expect(() => {
        net.registerSocket('1', () => {});
      }).to.not.throw();
    });
  });

  describe('UnregisterSocket', () => {
    it('should fail to unregister socket due to bad arguments', () => {
      expect(() => {
        net.unregisterSocket();
      }).throw(error.unRegisterBareSocketArgument);
      expect(() => {
        net.unregisterSocket(8080);
      }).throw(error.unRegisterBareSocketArgument);
    });
    it('should unregister socket', () => {
      expect(() => {
        net.unregisterSocket('1');
      }).to.not.throw();
    });
  });

  describe('disconnectSocket', () => {
    it('should fail to disconnect socket due to bad arguments', () => {
      expect(() => {
        net.disconnectSocket();
      }).throw(error.unRegisterBareSocketArgument);
      expect(() => {
        net.disconnectSocket(1);
      }).throw(error.unRegisterBareSocketArgument);
    });
    it('should disconnect socket', () => {
      expect(() => {
        net.disconnectSocket('1');
      }).not.throw();
    });
  });

  describe('newSocketBarrier', () => {
    it('should fail to handle new Socket barrier due to bad arguments', () => {
      expect(() => {
        net.newSocketBarrier();
      }).throw(error.newSocketBarrierArgument);
      expect(() => {
        net.newSocketBarrier(1);
      }).throw(error.newSocketBarrierArgument);
      expect(() => {
        net.newSocketBarrier('1');
      }).throw(error.newSocketBarrierArgument);
      expect(() => {
        net.newSocketBarrier('1', '100');
      }).throw(error.newSocketBarrierArgument);
    });
    it('should handle new socket barrier', () => {
      expect(() => {
        net.newSocketBarrier('1', 100);
      }).not.throw();
    });
  });

  describe('breakSocketBarrier', () => {
    it('should fail to handle break Socket barrier due to bad arguments', () => {
      expect(() => {
        net.breakSocketBarrier();
      }).throw(error.breakSocketBarrierArgument);
      expect(() => {
        net.breakSocketBarrier(1);
      }).throw(error.breakSocketBarrierArgument);
    });
    it('should handle break socket barrier', () => {
      expect(() => {
        net.breakSocketBarrier('1');
      }).not.throw();
    });
  });

  describe('waitForSocketClosure', () => {
    it('should fail to handle wait for socket closure due to bad arguments', () => {
      expect(() => {
        net.waitForSocketClosure();
      }).throw(`Bad argument passed to waitForWebSocketBarrier - Please pass socketId (string) & timeout (Integer). Passed arguments: [SocketId: ${undefined}, Timeout: ${undefined}]`);
      expect(() => {
        net.waitForSocketClosure('aa');
      }).throw(`Bad argument passed to waitForWebSocketBarrier - Please pass socketId (string) & timeout (Integer). Passed arguments: [SocketId: ${'aa'}, Timeout: ${undefined}]`);
      expect(() => {
        net.waitForSocketClosure('aa', '10');
      }).throw(`Bad argument passed to waitForWebSocketBarrier - Please pass socketId (string) & timeout (Integer). Passed arguments: [SocketId: ${'aa'}, Timeout: ${'10'}]`);
    });
    it('should wait for socket closure', () => {
      expect(() => {
        net.waitForSocketClosure('1', 100);
      }).not.throw();
    });
  });
});
