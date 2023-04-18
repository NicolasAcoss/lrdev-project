'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const EventEmitter = require('events').EventEmitter;
chai.use(sinonChai);

describe('Run logic client', () => {
  let RunLogicClient;
  let net;
  let connection;
  let logger;
  beforeEach(() => {
    connection = {
      on: () => { return connection; }
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

    RunLogicClient = proxyquire('./../run_logic_client', {
      net: net,
      './logger': logger
    });
  });

  it('should create a run logic client', () => {
    const runLogic = new RunLogicClient(new EventEmitter());
    expect(runLogic.eventEmitter).not.to.be.undefined;
    expect(runLogic.dataHandler).not.to.be.undefined;
  });

  it('should connect to the run logic', (done) => {
    const runLogic = new RunLogicClient(new EventEmitter());

    runLogic.connect({
      address: '123',
      controlPort: 12345
    })
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
    expect(net.createConnection).to.have.been.calledOnce;
    const connectionMock = {
      address: () => { return '12.12.12.12'; },
      callback: net.createConnection.firstCall.args[1],
      write: sinon.stub()
    };
    connectionMock.callback();
  });

  it('should handle the createVUsers command', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const runLogic = new RunLogicClient(eventEmitter);
    runLogic.connection = {
      writable: true,
      write: sinon.stub()
    };
    const commandMessage = JSON.stringify({
      content: {
        command: 'createVUsers',
        scriptDirectory: 'C:\\some\\path\\to\\script',
        userArgs: {
          arg1: 'val1'
        }
      }
    });
    runLogic.socketErrHandler = sinon.stub();
    runLogic.handleCommand(commandMessage);
    expect(eventEmitter.emit).to.have.been.calledWith('Create Vusers');
    expect(runLogic.socketErrHandler).not.to.have.been.called;
    const callback = eventEmitter.emit.firstCall.args[2];
    callback(null);
    expect(runLogic.connection.write).to.have.been.calledOnce;
  });

  it('should handle error in createVUsers command', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const runLogic = new RunLogicClient(eventEmitter);
    runLogic.connection = {
      writable: true,
      write: sinon.stub()
    };
    const commandMessage = JSON.stringify({
      content: {
        command: 'createVUsers',
        scriptDirectory: 'C:\\some\\path\\to\\script',
        userArgs: {
          arg1: 'val1'
        }
      }
    });
    runLogic.socketErrHandler = sinon.stub();
    runLogic.handleCommand(commandMessage);
    expect(eventEmitter.emit).to.have.been.calledWith('Create Vusers');
    expect(runLogic.socketErrHandler).not.to.have.been.called;
    const callback = eventEmitter.emit.firstCall.args[2];
    callback(null);
    expect(runLogic.connection.write).to.have.been.calledOnce;
  });

  it('should handle error in the createVUsers command', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const runLogic = new RunLogicClient(eventEmitter);

    const commandMessage = JSON.stringify({
      content: {
        command: 'createVUsers',
        scriptDirectory: 'C:\\some\\path\\to\\script',
        userArgs: {
          arg1: 'val1'
        }
      }
    });
    runLogic.socketErrHandler = sinon.stub();
    runLogic.handleCommand(commandMessage);
    expect(eventEmitter.emit).to.have.been.calledWith('Create Vusers');
    expect(runLogic.socketErrHandler).not.to.have.been.called;
  });

  it('should handle the run command', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const runLogic = new RunLogicClient(eventEmitter);

    const commandMessage = JSON.stringify({
      content: {
        command: 'run'
      }
    });
    runLogic.socketErrHandler = sinon.stub();
    runLogic.handleCommand(commandMessage);
    expect(eventEmitter.emit).to.have.been.calledWith('Run Vuser');
    expect(runLogic.socketErrHandler).not.to.have.been.called;
  });

  it('should handle the stop command', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const runLogic = new RunLogicClient(eventEmitter);

    const commandMessage = JSON.stringify({
      content: {
        command: 'stop'
      }
    });
    runLogic.socketErrHandler = sinon.stub();
    runLogic.handleCommand(commandMessage);
    expect(eventEmitter.emit).to.have.been.calledWith('Stop Vuser');
    expect(runLogic.socketErrHandler).not.to.have.been.called;
  });

  it('should handle unrecognized stop command', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const runLogic = new RunLogicClient(eventEmitter);

    const commandMessage = JSON.stringify({
      content: {
        command: ''
      }
    });
    runLogic.socketErrHandler = sinon.stub();
    runLogic.handleCommand(commandMessage);
    expect(eventEmitter.emit).to.not.have.been.called;
    expect(runLogic.socketErrHandler).to.have.been.called;
  });

  it('should handle corrupt json in command message', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const runLogic = new RunLogicClient(eventEmitter);

    const commandMessage = 'a';
    runLogic.socketErrHandler = sinon.stub();
    runLogic.handleCommand(commandMessage);
    expect(eventEmitter.emit).to.not.have.been.called;
    expect(runLogic.socketErrHandler).to.have.been.called;
  });

  it('should log a message', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const runLogic = new RunLogicClient(eventEmitter);
    runLogic.connection = {
      writable: true,
      write: sinon.stub()
    };
    runLogic.logMessage('foo', 'bar');
    expect(runLogic.connection.write).to.have.been.calledOnce;
    const message = JSON.parse(runLogic.connection.write.getCall(0).args[0]);
    expect(message.content.message).to.be.equal('foo');
    expect(message.content.logLevel).to.be.equal('bar');
  });

  it('should not log a message', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const runLogic = new RunLogicClient(eventEmitter);
    runLogic.connection = {
      writable: true,
      write: sinon.stub()
    };
    runLogic.logMessage('foo', -1);
    expect(runLogic.connection.write).to.not.have.been.called;
    const message = runLogic.connection.write.getCall(0);
    expect(message).to.be.null;
  });

  it('should handle stop in run logic client', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const runLogic = new RunLogicClient(eventEmitter);
    runLogic.connection = {
      writable: true,
      write: sinon.stub(),
      end: sinon.stub()
    };
    runLogic.stop();
    expect(runLogic.connection.end).to.have.been.calledOnce;
  });

  it('should handle connection error in run logic client', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const runLogic = new RunLogicClient(eventEmitter);
    runLogic.connection = {
      writable: true,
      write: sinon.stub(),
      end: sinon.stub()
    };
    runLogic.connEndHandler();
    expect(logger.trace).to.have.been.called;
  });

  it('should handle socket error in run logic client', () => {
    const eventEmitter = {
      emit: sinon.stub()
    };
    const runLogic = new RunLogicClient(eventEmitter);
    runLogic.connection = {
      writable: true,
      write: sinon.stub(),
      end: sinon.stub()
    };
    runLogic.socketErrHandler();
    expect(logger.error).to.have.been.called;
  });
});
