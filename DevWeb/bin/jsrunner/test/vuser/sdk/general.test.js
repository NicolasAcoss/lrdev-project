'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const utils = require('./../../../vuser/utils.js');
const {LoadError} = require('./../../../vuser/load_error.js');
const expect = chai.expect;
chai.use(sinonChai);
const ErrorCodes = require('./../../../vuser/error_codes');

describe('General', () => {
  let load;
  let message;
  let configStub;
  let logUtils;

  beforeEach(() => {
    message = {
      sendMessage: sinon.stub(),
      sendMessageSync: sinon.stub(),
      sendMessageSyncNoResponse: sinon.stub()
    };
    configStub = {
      config: {
        user: {
          userId: 10
        },
        script: {
          directory: __dirname
        }
      },
      log: sinon.stub()
    };

    logUtils = {internalLog: sinon.stub(), LogLevel: sinon.stub()};

    const logUtilsStub = function() {
      return logUtils;
    };

    load = proxyquire('./../../../vuser/sdk/general.js', {
      './../message.js': message,
      './../utils/log_utils.js': logUtilsStub
    })(configStub);
    //const utils = require('./../../../vuser/utils');
    utils.initialize('info', __dirname);
  });

  describe('log', () => {
    it('should send a log message with default log level', () => {
      load.log('MyMessage');
      expect(logUtils.internalLog).to.have.been.calledOnce;
      const content = logUtils.internalLog.firstCall.args[0];
      expect(content).to.be.equal('MyMessage');
    });
  });

  describe('sleep', () => {
    it('should send the given time', () => {
      load.sleep(123.456);
      expect(message.sendMessageSync).to.have.been.calledOnce;
      const content = message.sendMessageSync.firstCall.args[2];
      expect(content.time).to.be.equal(123.456);
    });

    it('should not send if the number is a string, a null, undefined, negative', () => {
      load.sleep('123.456');
      load.sleep(-123.456);
      load.sleep(null);
      load.sleep();
      expect(message.sendMessageSync).not.to.have.been.called;
    });
  });

  describe('exit', () => {
    it('should send an abort message', () => {
      expect(() => {
        load.exit(load.ExitType.abort, 'Foo');
        expect(message.sendMessageSync).to.have.been.calledOnce;
      }).to.throw('Foo');
    });

    it('should abort with iteration by default', () => {
      expect(() => {
        load.exit();
        expect(message.sendMessageSync).to.have.been.calledOnce;
        const content = message.sendMessageSync.firstCall.args[2];
        expect(content.ExitType).to.be.equal(load.ExitType.iteration);
      }).to.throw();
    });

    it('should not abort for incorrect abort type', () => {
      expect(() => {
        load.exit('Foo', 'Bar');
      }).to.throw('exit type must be one of').with.property('code', ErrorCodes.sdk);
      expect(message.sendMessageSync).not.to.have.been.calledOnce;
    });
  });

  describe('unmask', () => {
    it('should unmask a base64 string', () => {
      const result = load.unmask('c2Rmc2Zkc2Rmc2Y=');
      expect(result).to.be.ok;
    });

    it('should not unmask an empty string', () => {
      expect(() => {
        load.unmask('');
      }).to.throw('expression must be a string').with.property('code', ErrorCodes.sdk);
    });

    it('should not unmask an invalid base64 string', () => {
      expect(() => {
        load.unmask('Hello World');
      }).to.throw('expression must be a valid base64 string').with.property('code', ErrorCodes.sdk);
    });
  });

  describe('decrypt', () => {
    it('should decrypt a base64 string', () => {
      const result = load.decrypt('c2Rmc2Zkc2Rmc2Y=');
      expect(result).to.be.ok;
    });

    it('should not decrypt an empty string', () => {
      expect(() => {
        load.decrypt('');
      }).to.throw('expression must be a string').with.property('code', ErrorCodes.sdk);
    });

    it('should not decrypt an invalid base64 string', () => {
      expect(() => {
        load.decrypt('Hello World');
      }).to.throw('expression must be a valid base64 string').with.property('code', ErrorCodes.sdk);
    });
  });

  describe('exec', () => {
    it('should send exec with command and args', () => {
      load.exec('command', ['arg1', 'arg2']);
      expect(message.sendMessageSync).to.have.been.calledOnce;
      const content = message.sendMessageSync.firstCall.args[2];
      expect(content.command).to.be.equal('command');
      expect(content.args).to.be.eql(['arg1', 'arg2']);
    });

    it('should send exec with object', () => {
      load.exec({
        command: 'command',
        args: ['arg1', 'arg2']
      });
      expect(message.sendMessageSync).to.have.been.calledOnce;
      const content = message.sendMessageSync.firstCall.args[2];
      expect(content.command).to.be.equal('command');
      expect(content.args).to.be.eql(['arg1', 'arg2']);
    });

    it('should send async exec with object', (done) => {
      message.sendMessage.returns(Promise.resolve());
      load.exec({
        command: 'command',
        args: ['arg1', 'arg2'],
        isAsync: true
      }).then(() => {
        expect(message.sendMessage).to.have.been.calledOnce;
        const content = message.sendMessage.firstCall.args[2];
        expect(content.command).to.be.equal('command');
        expect(content.args).to.be.eql(['arg1', 'arg2']);
        done();
      });
    });

    it('should not send exec without command', () => {
      expect(() => {
        load.exec();
      }).to.throw('exec can take a string command or a configuration object but undefined was sent').with.property('code', ErrorCodes.sdk);
    });

    it('should not send exec if object has no command argument', () => {
      expect(() => {
        load.exec({});
      }).to.throw('options must contain a non empty command property but undefined was provided').with.property('code', ErrorCodes.sdk);
    });

    it('should send exec and return error if an error was returned by the engine', () => {
      message.sendMessageSync.returns(new LoadError('Error!', '', {
        message: 'Oh no!'
      }, 123));
      expect(() => {
        load.exec({
          command: 'command',
          args: ['arg1', 'arg2']
        });
      }).to.throw('Oh no!').with.property('code', 123);
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('should send async exec and return error if an error was returned by the engine', (done) => {
      message.sendMessage.returns(Promise.resolve(new LoadError('Error!', '', {
        message: 'Oh no!'
      })));
      load.exec({
        command: 'command',
        args: ['arg1', 'arg2'],
        isAsync: true
      }).then(() => {
        done('Should not get here');
      }).catch((response) => {
        expect(response.message).to.be.equal('Oh no!');
        done();
      });
    });
  });
});
