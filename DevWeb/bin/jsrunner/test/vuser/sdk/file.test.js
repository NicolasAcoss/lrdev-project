'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const {LoadError} = require('./../../../vuser/load_error.js');
const validators = require('./../../../utils/validator.js');
chai.use(sinonChai);

describe('File', () => {
  let load;
  let message;
  let configStub;
  let logUtils;

  beforeEach(() => {
    message = {
      sendMessageSync: sinon.stub()
    };
    configStub = {
      extractors: {},
      config: {
        user: {
          userId: 10
        }
      },
      LogLevel: {
        error: 'error'
      }
    };
    logUtils = {
      internalLog: sinon.stub(),
      LogLevel: {}
    };

    const requestUtils = proxyquire('./../../../vuser/utils/request_utils.js', {
      './../message.js': message,
      './../utils/log_utils.js': () => logUtils,
      './../../utils/validator.js': validators
    });

    load = proxyquire('./../../../vuser/sdk/file.js', {
      './../utils/request_utils.js': requestUtils,
      './../message.js': message,
      './../utils/log_utils.js': () => logUtils,
      './../../utils/validator.js': validators
    })(configStub);
  });

  describe('Constructor', () => {
    it('should create a file object', () => {
      const file = new load.File('Hello.txt');
      expect(file).to.be.ok;
      expect(file.path).to.be.equal('Hello.txt');
    });

    it('should not create a file without a path', () => {
      expect(() => {
        const file = new load.File(null);
        expect(file).to.be.undefined;
      }).to.throw('path must be a non empty string but null was given');
    });
  });

  describe('read', () => {
    it('should read a file', () => {
      message.sendMessageSync.returns({
        content: 'abc'
      });
      const file = new load.File('foo.txt');
      const data = file.read();
      expect(data.content).to.be.equal('abc');
    });

    it('should read a binary file', () => {
      message.sendMessageSync.returns({
        content: Buffer.from('abc').toString('base64')
      });
      const file = new load.File('foo.txt');
      const data = file.read({
        isBinaryContent: true
      });
      expect(Buffer.isBuffer(data.content)).to.be.true;
      expect(data.content.toString('ascii')).to.be.equal('abc');
    });

    it('should throw if the response was an error', () => {
      message.sendMessageSync.returns(new LoadError('a', 'b', 'c'));
      expect(() => {
        const file = new load.File('foo.txt');
        file.read();
      }).to.throw('b');
    });

    it('should transform an extracted value', () => {
      const extractors = require('./../../../vuser/sdk/extractors')(configStub);
      message.sendMessageSync.returns({
        extractors: {
          testExtractor: 'test'
        }
      });
      const oldIsExtractor = validators.specific.isExtractor;
      validators.specific.isExtractor = sinon.stub().returns(true);
      const transformFunction = function(value) {
        return `${value}_transformed`;
      };
      const file = new load.File('foo.txt');
      const data = file.read({
        extractors: [
          new extractors.BoundaryExtractor('testExtractor', {
            transform: transformFunction,
            leftBoundary: 'hello'
          })
        ]
      });
      validators.specific.isExtractor = oldIsExtractor;
      expect(data.extractors.testExtractor).to.be.equal('test_transformed');
      expect(configStub.extractors.testExtractor).to.be.equal('test_transformed');
    });

    it('should throw if value validation fails on an extracted value', () => {
      const extractors = require('./../../../vuser/sdk/extractors')(configStub);
      message.sendMessageSync.returns({
        extractors: {
          testExtractor: 'test'
        }
      });
      const file = new load.File('foo.txt');
      configStub.log = sinon.stub();
      configStub.LogLevel = {error: 'error'};
      configStub.ExitType = {iteration: 'iteration'};
      configStub.exit = sinon.stub();
      file.read({
        extractors: [
          new extractors.BoundaryExtractor('testExtractor', {
            failOn: 'test',
            leftBoundary: 'hello'
          })
        ]
      });
      expect(configStub.exit).to.have.been.calledWith('iteration', 'Replay aborted by extractor "testExtractor"');
    });
  });

  describe('append', () => {
    it('should append to a file', () => {
      message.sendMessageSync.returns('abc');
      const file = new load.File('foo.txt');
      const data = file.append('string');
      expect(data).to.be.equal('abc');
    });

    it('should append binary data to a file', () => {
      message.sendMessageSync.returns('abc');
      const file = new load.File('foo.txt');
      const data = file.append(Buffer.from('string'));
      expect(data).to.be.equal('abc');
      const messagData = message.sendMessageSync.getCall(0).args[2];
      expect(messagData.isBinaryData).to.be.true;
    });

    it('should throw if the response was an error', () => {
      message.sendMessageSync.returns(new LoadError('a', 'b', 'c'));
      expect(() => {
        const file = new load.File('foo.txt');
        file.append('abcd');
      }).to.throw('b');
    });
  });

  describe('write', () => {
    it('should write to file', () => {
      message.sendMessageSync.returns('abc');
      const file = new load.File('foo.txt');
      const data = file.write('string');
      expect(data).to.be.equal('abc');
    });

    it('should write binary data to a file', () => {
      message.sendMessageSync.returns('abc');
      const file = new load.File('foo.txt');
      const data = file.write(Buffer.from('string'));
      expect(data).to.be.equal('abc');
      const messagData = message.sendMessageSync.getCall(0).args[2];
      expect(messagData.isBinaryData).to.be.true;
    });

    it('should throw if the response was an error', () => {
      message.sendMessageSync.returns(new LoadError('a', 'b', 'c'));
      expect(() => {
        const file = new load.File('foo.txt');
        file.write('abcd');
      }).to.throw('b');
    });
  });

  describe('isExists', () => {
    it('should return true on existing file', () => {
      message.sendMessageSync.returns(true);
      const file = new load.File('foo.txt');
      const data = file.isExists();
      expect(data).to.be.equal(true);
    });

    it('should throw if the response was an error', () => {
      message.sendMessageSync.returns(new LoadError('a', 'b', 'c', 1));
      expect(() => {
        const file = new load.File('foo.txt');
        file.isExists();
      }).to.throw('b').with.property('code', 1);
    });
  });
});
