'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const EventEmitter = require('events').EventEmitter;
chai.use(sinonChai);

describe('Orchestrator client', () => {
  let OrchestratorClient;
  let net;
  let connection;
  let logger;
  beforeEach(() => {
    connection = {
      on: sinon.stub()
    };
    net = {
      createConnection: sinon.stub().returns(connection)
    };
    logger = {
      needToLog(level) {
        return level !== -1;
      },
      showInConsole: true,
      trace: sinon.stub(),
      error: sinon.stub()
    };
    OrchestratorClient = proxyquire('./../orchestrator_client', {
      net: net,
      './logger': logger
    });
  });

  it('should create an orchestrator client', () => {
    const orchestrator = new OrchestratorClient(new EventEmitter());
    expect(orchestrator.eventEmitter).not.to.be.undefined;
    expect(orchestrator.dataHandler).not.to.be.undefined;
  });

  it('should connect to the Orchestrator', () => {
    const orchestrator = new OrchestratorClient(new EventEmitter());
    orchestrator.connect();
    expect(net.createConnection).to.have.been.calledOnce;
  });

  it('should handle connection', () => {
    const orchestrator = new OrchestratorClient(new EventEmitter());
    const fakeConnection = {
      write: sinon.stub(),
      address: function() {
        return '127.0.0.1';
      },
      handleConnection: orchestrator.handleConnection
    };

    fakeConnection.handleConnection();
    expect(fakeConnection.write).to.have.been.calledOnce;
  });

  it('should handle the init command', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const orchestrator = new OrchestratorClient(eventEmitter);

    const commandMessage = JSON.stringify({
      content: {
        command: 'init'
      }
    });
    orchestrator.socketErrHandler = sinon.stub();
    orchestrator.handleCommand(commandMessage);
    expect(eventEmitter.emit).to.have.been.calledWith('Init JsRunner');
    expect(orchestrator.socketErrHandler).not.to.have.been.called;
  });

  it('should handle the close command', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const orchestrator = new OrchestratorClient(eventEmitter);
    const commandMessage = JSON.stringify({
      content: {
        command: 'close'
      }
    });
    orchestrator.socketErrHandler = sinon.stub();
    orchestrator.connection = {
      write: sinon.stub(),
      destroy: sinon.stub()
    };
    orchestrator.handleCommand(commandMessage);
    expect(eventEmitter.emit).to.have.been.calledWith('Close Runner');
    expect(orchestrator.socketErrHandler).not.to.have.been.called;
  });

  it('should handle the stop command', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const orchestrator = new OrchestratorClient(eventEmitter);
    const commandMessage = JSON.stringify({
      content: {
        command: 'stop'
      }
    });
    orchestrator.socketErrHandler = sinon.stub();
    orchestrator.connection = {
      write: sinon.stub(),
      destroy: sinon.stub()
    };
    orchestrator.handleCommand(commandMessage);
    expect(eventEmitter.emit).to.have.been.calledWith('Stop Runner');
    expect(orchestrator.socketErrHandler).not.to.have.been.called;
  });

  it('should handle an unrecognized command', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const orchestrator = new OrchestratorClient(eventEmitter);
    const commandMessage = JSON.stringify({
      content: {
        command: 'very strange command'
      }
    });
    orchestrator.socketErrHandler = sinon.stub();
    orchestrator.handleCommand(commandMessage);
    expect(orchestrator.socketErrHandler).to.have.been.called;
  });

  it('should handle stop', () => {
    const orchestrator = new OrchestratorClient();
    orchestrator.connection = {
      end: sinon.stub(),
      write: sinon.stub()
    };

    orchestrator.stop();
    expect(orchestrator.connection.write).to.have.been.called;
    const callback = orchestrator.connection.write.firstCall.args[1];
    callback();
    expect(orchestrator.connection.end).to.have.been.called;
  });

  it('should handle close', () => {
    const orchestrator = new OrchestratorClient();
    orchestrator.connection = {
      end: sinon.stub(),
      write: sinon.stub()
    };
    orchestrator.close();
    expect(orchestrator.connection.write).to.have.been.called;
    const message = JSON.parse(orchestrator.connection.write.firstCall.args[0]);
    expect(message).to.not.be.undefined;
    const {
      state,
      status
    } = message.content;
    expect(state).to.be.equal('close');
    expect(status).to.be.equal('success');
  });

  it('should handle unknown command', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const orchestrator = new OrchestratorClient(eventEmitter);

    const commandMessage = JSON.stringify({
      content: {
        command: 'unknown'
      }
    });
    orchestrator.socketErrHandler = sinon.stub();
    orchestrator.handleCommand(commandMessage);
    expect(eventEmitter.emit).to.not.have.been.called;
    expect(orchestrator.socketErrHandler).to.have.been.called;
  });

  it('should handle corrupted JSON command', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const orchestrator = new OrchestratorClient(eventEmitter);
    const commandMessage = JSON.stringify(`'a':"a"`);
    orchestrator.socketErrHandler = sinon.stub();
    orchestrator.handleCommand(commandMessage);
    expect(eventEmitter.emit).to.not.have.been.called;
    expect(orchestrator.socketErrHandler).to.have.been.called;
  });

  it('should handle socket error', () => {
    const orchestrator = new OrchestratorClient();
    sinon.stub(process, 'exit');
    orchestrator.socketErrHandler({code: 'ECONNRESET'});
    expect(process.exit.isSinonProxy).to.be.true;
  });

  it('should notify initialization status', () => {
    const orchestrator = new OrchestratorClient();
    orchestrator.connection = {
      write: sinon.stub()
    };
    orchestrator.notifyInitializationStatus('status');
    expect(orchestrator.connection.write).to.have.been.called;
  });

  it('should handle connection error', () => {
    const orchestrator = new OrchestratorClient();
    orchestrator.socketErrHandler({code: ''});
    expect(logger.error).to.have.been.called;
  });

  it('should notify connection end', () => {
    const orchestrator = new OrchestratorClient();
    orchestrator.connEndHandler();
    expect(logger.trace).to.have.been.called;
  });
});