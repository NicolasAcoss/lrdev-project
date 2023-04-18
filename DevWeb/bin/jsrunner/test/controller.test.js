'use strict';

const proxyquire = require('proxyquire').noCallThru();
const chai = require('chai');

const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

describe('controller', () => {
  let OrchestratorClient;
  let RunLogicClient;
  let JSRunner;
  let Controller;

  beforeEach(() => {
    OrchestratorClient = sinon.stub();
    RunLogicClient = sinon.stub();
    JSRunner = sinon.stub().returns({
      initialize: sinon.stub()
    });
    Controller = proxyquire('./../controller', {
      './orchestrator_client': OrchestratorClient,
      './run_logic_client': RunLogicClient,
      './jsRunner.js': JSRunner
    });
  });

  it('should create a controller and register all the events', () => {
    const controller = new Controller({ foo: 'bar' });
    expect(OrchestratorClient).to.have.been.called;
    expect(RunLogicClient).to.have.been.called;
    expect(controller.options).not.to.be.undefined;
    expect(controller.options.foo).to.be.equal('bar');
  });

  it('should connect to the Orchestrator upon start', () => {
    const orchestratorConnection = {
      connect: sinon.stub()
    };
    OrchestratorClient.returns(orchestratorConnection);
    const controller = new Controller({ foo: 'bar' });
    controller.start();
    expect(orchestratorConnection.connect).to.have.been.called;
  });

  it('should init JS Runner when the appropriate event is raised', (done) => {
    const runLogicConnection = {
      connect: sinon.stub(),
      logMessage: sinon.stub()
    };
    RunLogicClient.returns(runLogicConnection);
    runLogicConnection.connect.returns(Promise.resolve());
    const orchestratorConnection = {
      notifyInitializationStatus: sinon.stub()
    };
    OrchestratorClient.returns(orchestratorConnection);
    const controller = new Controller({ foo: 'bar' });
    const options = {};
    controller.eventEmitter.emit('Init JsRunner', options);
    setTimeout(() => {
      expect(orchestratorConnection.notifyInitializationStatus).to.have.been.calledWith('success');
      done();
    }, 1);
  });

  it('should fail to init JS Runner when the appropriate event is raised', (done) => {
    const runLogicConnection = {
      connect: sinon.stub().returns(Promise.reject(new Error()))
    };
    RunLogicClient.returns(runLogicConnection);
    const orchestratorConnection = {
      notifyInitializationStatus: sinon.stub()
    };
    OrchestratorClient.returns(orchestratorConnection);
    const controller = new Controller({ foo: 'bar' });
    const options = {};
    controller.eventEmitter.emit('Init JsRunner', options);
    setTimeout(() => {
      expect(orchestratorConnection.notifyInitializationStatus).to.have.been.calledWith('error');
      done();
    }, 1);
  });

  it('should create vusers when the appropriate event is raised', (done) => {
    const runLogicConnection = {
      connect: sinon.stub()
    };
    RunLogicClient.returns(runLogicConnection);
    runLogicConnection.connect.returns(Promise.resolve());
    const orchestratorConnection = {
      notifyInitializationStatus: sinon.stub()
    };
    OrchestratorClient.returns(orchestratorConnection);

    const jsRunner = {
      prepVusers: sinon.stub(),
      runVUsers: sinon.stub().returns(Promise.resolve())
    };
    JSRunner.returns(jsRunner);
    const controller = new Controller({ foo: 'bar' });
    const options = {};
    controller.eventEmitter.emit('Init JsRunner', options);
    setTimeout(() => {
      const callback = sinon.stub();
      controller.eventEmitter.emit('Create Vusers', options, callback);
      setTimeout(() => {
        expect(callback).to.have.been.called;
        done();
      }, 2);
    }, 1);
  });

  it('should handle error when creating vusers', (done) => {
    const runLogicConnection = {
      connect: sinon.stub()
    };
    RunLogicClient.returns(runLogicConnection);
    runLogicConnection.connect.returns(Promise.resolve());
    const orchestratorConnection = {
      notifyInitializationStatus: sinon.stub()
    };
    OrchestratorClient.returns(orchestratorConnection);

    const jsRunner = {
      prepVusers: sinon.stub(),
      runVUsers: sinon.stub().rejects()
    };
    JSRunner.returns(jsRunner);
    const controller = new Controller({ foo: 'bar' });
    const options = {};
    controller.eventEmitter.emit('Init JsRunner', options);
    setTimeout(() => {
      const callback = sinon.stub();
      controller.eventEmitter.emit('Create Vusers', options, callback);
      setTimeout(() => {
        expect(callback).to.have.been.called;
        done();
      }, 2);
    }, 1);
  });

  it('should stop vusers when the appropriate event is raised', (done) => {
    const runLogicConnection = {
      connect: sinon.stub()
    };
    RunLogicClient.returns(runLogicConnection);
    runLogicConnection.connect.returns(Promise.resolve());
    const orchestratorConnection = {
      notifyInitializationStatus: sinon.stub()
    };
    OrchestratorClient.returns(orchestratorConnection);

    const jsRunner = {
      stopVuser: sinon.stub().returns(Promise.resolve())
    };
    JSRunner.returns(jsRunner);
    const controller = new Controller({ foo: 'bar' });
    controller.eventEmitter.emit('Init JsRunner', {});
    setTimeout(() => {
      controller.eventEmitter.emit('Stop Vuser');
      setTimeout(() => {
        expect(jsRunner.stopVuser).to.have.been.called;
        done();
      }, 2);
    }, 1);
  });

  it('should handle stop Vuser error', (done) => {
    const runLogicConnection = {
      connect: sinon.stub().returns(Promise.resolve()),
      logMessage: sinon.stub()
    };
    RunLogicClient.returns(runLogicConnection);
    const orchestratorConnection = {
      notifyInitializationStatus: sinon.stub()
    };
    OrchestratorClient.returns(orchestratorConnection);

    const jsRunner = {
      stopVuser: sinon.stub().rejects({})
    };
    JSRunner.returns(jsRunner);
    const controller = new Controller({ foo: 'bar' });
    controller.eventEmitter.emit('Init JsRunner', {});
    setTimeout(() => {
      controller.eventEmitter.emit('Stop Vuser');
      setTimeout(() => {
        expect(jsRunner.stopVuser).to.have.been.called;
        expect(runLogicConnection.logMessage).to.have.been.called;
        done();
      }, 2);
    }, 1);
  });

  it('should run vusers when the appropriate event is raised', (done) => {
    const runLogicConnection = {
      connect: sinon.stub()
    };
    RunLogicClient.returns(runLogicConnection);
    runLogicConnection.connect.returns(Promise.resolve());
    const orchestratorConnection = {
      notifyInitializationStatus: sinon.stub()
    };
    OrchestratorClient.returns(orchestratorConnection);

    const jsRunner = {
      runVUserStage: sinon.stub()
    };
    JSRunner.returns(jsRunner);
    const controller = new Controller({ foo: 'bar' });
    const options = {};
    controller.eventEmitter.emit('Init JsRunner', options);
    setTimeout(() => {
      const callback = sinon.stub();
      controller.eventEmitter.emit('Run Vuser', options, callback, ['kk', 'ff']);
      setTimeout(() => {
        expect(jsRunner.runVUserStage).to.have.been.called;
        done();
      }, 2);
    }, 1);
  });

  it('should stop JS Runner when the appropriate event is raised', (done) => {
    const runLogicConnection = {
      connect: sinon.stub(),
      close: sinon.stub(),
      stop: sinon.stub()
    };
    RunLogicClient.returns(runLogicConnection);
    runLogicConnection.connect.returns(Promise.resolve());
    const orchestratorConnection = {
      notifyInitializationStatus: sinon.stub(),
      close: sinon.stub(),
      stop: sinon.stub()
    };
    OrchestratorClient.returns(orchestratorConnection);

    const jsRunner = {
      closeRunner: sinon.stub(),
      stopRunner: sinon.stub()
    };
    JSRunner.returns(jsRunner);
    const controller = new Controller({ foo: 'bar' });
    const options = {};
    controller.eventEmitter.emit('Init JsRunner', options);
    setTimeout(() => {
      const callback = sinon.stub();
      controller.eventEmitter.emit('Close Runner', callback);
      setTimeout(() => {
        expect(jsRunner.stopRunner).to.have.been.called;
        controller.eventEmitter.emit('Stop Runner', callback);
        setTimeout(() => {
          expect(orchestratorConnection.stop).to.have.been.called;
          done();
        }, 3);
      }, 2);
    }, 1);
  });

  it('should handle error when closing JS Runner', (done) => {
    const runLogicConnection = {
      connect: sinon.stub(),
      close: sinon.stub(),
      stop: sinon.stub(),
      logMessage: sinon.stub()
    };
    RunLogicClient.returns(runLogicConnection);
    runLogicConnection.connect.returns(Promise.resolve());
    const orchestratorConnection = {
      notifyInitializationStatus: sinon.stub(),
      close: sinon.stub(),
      stop: sinon.stub()
    };
    OrchestratorClient.returns(orchestratorConnection);

    const jsRunner = {
      closeRunner: sinon.stub(),
      stopRunner: sinon.stub().rejects(new Error())
    };

    JSRunner.returns(jsRunner);
    const controller = new Controller({ foo: 'bar' });
    const options = {};
    controller.eventEmitter.emit('Init JsRunner', options);
    setTimeout(() => {
      const callback = sinon.stub();
      controller.eventEmitter.emit('Close Runner', callback);
      setTimeout(() => {
        expect(jsRunner.stopRunner).to.have.been.called;
        expect(runLogicConnection.logMessage).to.have.been.called;
        done();
      });
    });
  });
});
