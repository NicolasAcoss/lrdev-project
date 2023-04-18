'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
describe('bogatyr', () => {
  let Bogatyr;
  let bogatyr;
  class communicator {
    constructor() {
      return {
        initialize: sinon.stub(),
        initVuser: sinon.stub(),
        stop: sinon.stub()
      };
    }
  }
  class executor {
    constructor() {
      return {
        initVuser: sinon.stub(),
        run: sinon.stub(),
        runVuserStage: sinon.stub(),
        stop: sinon.stub()
      };
    }
  }
  beforeEach(async() => {
    Bogatyr = proxyquire('./../../bogatyr/bogatyr', {
      './communicator.js': communicator,
      './executor.js': executor
    });
    bogatyr = new Bogatyr({
      logLevel: 1,
      onLogMessage: sinon.stub(),
      host: 'a',
      port: 1
    });
    await bogatyr.initialize();
    expect(bogatyr.communicator).to.not.be.undefined;
    expect(bogatyr.communicator.initialize).to.have.been.called;
  });

  it('runVuser', () => {
    bogatyr.runVuser({vuserId: 1}).then(() => {
      const executionManager = bogatyr.vusers.get(1);
      expect(executionManager).to.not.be.undefined;
      expect(executionManager.communicator).to.not.be.undefined;
      expect(executionManager.executor).to.not.be.undefined;
      expect(executionManager.communicator.initVuser).to.have.been.called;
      expect(executionManager.executor.initVuser).to.have.been.called;
      expect(executionManager.executor.run).to.have.been.called;
    });
  });

  it('handle runVuserStage', (done) => {
    bogatyr.runVuser({vuserId: 1}).then(() => {
      bogatyr.runVuserStage(1);
      const executionManager = bogatyr.vusers.get(1);
      expect(executionManager).to.not.be.undefined;
      expect(executionManager.executor).to.not.be.undefined;
      expect(executionManager.executor.runVuserStage).to.have.been.called;
      done();
    });
  });

  it('handle runVuserStage error for undefined vuser', () => {
    expect(() => bogatyr.runVuserStage(1)).to.throw('vuser with id 1 has no execution manager');
  });

  it('handle stopVuser', (done) => {
    bogatyr.runVuser({vuserId: 1}).then(() => {
      bogatyr.stopVuser(1);
      const executionManager = bogatyr.vusers.get(1);
      expect(executionManager).to.not.be.undefined;
      expect(executionManager.executor).to.not.be.undefined;
      expect(executionManager.executor.stop).to.have.been.called;
      done();
    });
  });

  it('handle stopVuser error for undefined vuser', (done) => {
    bogatyr.stopVuser(1).catch((err) => {
      expect(err.message).to.be.equal('vuser with id 1 has no execution manager');
      done();
    });
  });

  it('handle stop bogatyr with vusers', (done) => {
    bogatyr.stopAllVusers().then(() => {
      expect(bogatyr.communicator.stop).to.have.been.called;
      done();
    });
  });

  it('handle stop bogatyr with vusers', (done) => {
    bogatyr.runVuser({vuserId: 1}).then(() => {
      bogatyr.stopAllVusers().then(() => {
        const executionManager = bogatyr.vusers.get(1);
        expect(executionManager).to.not.be.undefined;
        expect(executionManager.executor).to.not.be.undefined;
        expect(executionManager.executor.stop).to.have.been.called;
        expect(bogatyr.communicator.stop).to.have.been.called;
        done();
      });
    });
  });

  it('handle stop bogatyr no vusers', (done) => {
    bogatyr.stopAllVusers().then(() => {
      expect(bogatyr.communicator.stop).to.have.been.called;
      done();
    });
  });
});