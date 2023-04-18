'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const {LoadError} = require('./../../../vuser/load_error');
const validators = require('./../../../utils/validator.js');
const expect = chai.expect;
chai.use(sinonChai);
const ErrorCodes = require('./../../../vuser/error_codes');

describe('gRPC', () => {
  let load;
  let message;
  let configMock;
  beforeEach(() => {
    message = {
      sendMessageSync: sinon.stub(),
      sendMessage: sinon.stub()
    };
    configMock = {
      config: {
        user: {
          userId: '1'
        }
      },
      log: sinon.stub(),
      LogLevel: {
        error: 'error'
      }
    };
    load = proxyquire('./../../../vuser/sdk/grpc.js', {
      './../message.js': message
    })(configMock);
    configMock.GrpcRequest = load.GrpcRequest;
    configMock.GrpcResponse = load.GrpcResponse;
  });

  describe('client', () => {
    it('should create a gRPC client', () => {
      const grpcClient = new load.GrpcClient('myHost');
      expect(grpcClient.host).to.be.equal('myHost');
    });

    it('should create a gRPC client with options', () => {
      const grpcClient = new load.GrpcClient({host: 'myHost'});
      expect(grpcClient.host).to.be.equal('myHost');
    });

    it('should error when there is no host in options', () => {
      expect(() => {
        const grpcClient = new load.GrpcClient({isInsecure: true});
        expect(grpcClient).to.be.undefined;
      }).to.throw('GrpcClient options must have a "host" property').with.property('code', ErrorCodes.sdk);
    });

    it('should error when there is no options', () => {
      expect(() => {
        const grpcClient = new load.GrpcClient();
        expect(grpcClient).to.be.undefined;
      }).to.throw('GrpcClient options must have a "host" property').with.property('code', ErrorCodes.sdk);
    });
  });
  describe('Unary', () => {
    it('should get gRPC client unary method', () => {
      const grpcClient = new load.GrpcClient({host: 'myHost'});
      const unary = grpcClient.unaryRequest({method: 'foo', protoFile: 'proto'});
      expect(unary.method).to.be.equal('foo');
    });

    it('should throw error for invalid argument in gRPC client unary method', () => {
      const grpcClient = new load.GrpcClient({host: 'myHost'});
      expect(() => {
        grpcClient.unaryRequest({method: 1, protoFile: 'proto'});
      }).to.throw();
      expect(() => {
        grpcClient.unaryRequest({method: 'foo', protoFile: 1});
      }).to.throw();
    });

    it('should allow to override defaults', () => {
      const grpcClient = new load.GrpcClient({host: 'myHost', defaults: {returnBody: true}});
      const unary = grpcClient.unaryRequest({method: 'foo', protoFile: 'proto'});
      expect(unary.returnBody).to.be.equal(true);
    });

    it('should override defaults with options', () => {
      const grpcClient = new load.GrpcClient({host: 'myHost', defaults: {method: 'foo'}});
      const unary = grpcClient.unaryRequest({method: 'bar', protoFile: 'proto'});
      expect(unary.method).to.be.equal('bar');
    });

    it('should deep override defaults', () => {
      const grpcClient = new load.GrpcClient({
        host: 'myHost',
        defaults: {
          headers: {
            MyHeader: 'Wow'
          }
        }
      });
      const unary = grpcClient.unaryRequest({method: 'bar', protoFile: 'proto'});
      expect(unary.headers['MyHeader']).to.be.equal('Wow');
    });

    it('should deep override defaults with options', () => {
      const grpcClient = new load.GrpcClient({
        host: 'myHost',
        defaults: {
          headers: {
            MyHeader: 'Wow'
          }
        }
      });
      const unary = grpcClient.unaryRequest({
        method: 'bar',
        protoFile: 'proto',
        headers: {
          Foo: 'Bar'
        }
      });
      expect(unary.headers['MyHeader']).to.be.equal('Wow');
      expect(unary.headers['Foo']).to.be.equal('Bar');
    });

    it('should invoke unary gRPC method', () => {
      message.sendMessageSync.returns({
        status: 'OK'
      });
      const grpcClient = new load.GrpcClient('myHost');
      const unary = grpcClient.unaryRequest({
        host: 'myHost',
        method: 'foo',
        protoFile: 'proto',
        extractors: 'Hello'
      });
      const oldIsExtractor = validators.specific.isExtractor;
      validators.specific.isExtractor = sinon.stub().returns(true);
      const response = unary.sendSync();
      expect(response).to.be.ok;
      expect(response.status).to.be.equal('OK');
      expect(validators.specific.isExtractor).to.have.been.calledOnce;
      validators.specific.isExtractor = oldIsExtractor;
    });

    it('should throw error when invoke unary gRPC method causes exception', () => {
      message.sendMessageSync.returns(new LoadError());
      const grpcClient = new load.GrpcClient('myHost');
      const unary = grpcClient.unaryRequest({host: 'myHost', method: 'foo', protoFile: 'proto'});
      expect(() => {
        unary.sendSync();
      }).to.throw();
    });

    it('should send GrpcRequest with json body object', () => {
      message.sendMessageSync.returns({
        status: 'OK'
      });
      const grpcClient = new load.GrpcClient('myHost');
      const unary = grpcClient.unaryRequest({
        method: 'foo',
        protoFile: 'proto',
        headers: {
          Foo: 'Bar'
        },
        body: {
          foo: 'bar',
          boo: 1
        }
      });
      unary.sendSync();
      expect(message.sendMessageSync).to.be.calledOnce;
      const sentRequest = message.sendMessageSync.getCall(0).args[2];
      expect(sentRequest.method).to.be.equal('foo');
      expect(sentRequest.body).to.be.eql('{"foo":"bar","boo":1}');
    });

    it('should send GrpcRequest with json body object and slashes', () => {
      message.sendMessageSync.returns({
        status: 'OK'
      });
      const grpcClient = new load.GrpcClient('myHost');
      const unary = grpcClient.unaryRequest({
        method: 'foo',
        protoFile: 'proto',
        headers: {
          Foo: 'Bar'
        },
        body: {
          foo: 'bar\\/',
          boo: 1
        }
      });
      unary.sendSync();
      expect(message.sendMessageSync).to.be.calledOnce;
      const sentRequest = message.sendMessageSync.getCall(0).args[2];
      expect(sentRequest.method).to.be.equal('foo');
      expect(sentRequest.body).to.be.eql('{"foo":"bar\\/","boo":1}');
    });

    it('should send GrpcRequest with json body array (object)', () => {
      message.sendMessageSync.returns({
        status: 'OK'
      });
      const grpcClient = new load.GrpcClient('myHost');
      const unary = grpcClient.unaryRequest({
        method: 'foo',
        protoFile: 'proto',
        headers: {
          Foo: 'Bar'
        },
        bodyArray: [{
          foo: 'bar',
          boo: 1
        }]
      });
      unary.sendSync();
      expect(message.sendMessageSync).to.be.calledOnce;
      const sentRequest = message.sendMessageSync.getCall(0).args[2];
      expect(sentRequest.method).to.be.equal('foo');
      expect(sentRequest.bodyArray.toString()).to.be.equal('{"foo":"bar","boo":1}');
    });
    it('should send GrpcRequest with json body array (string)', () => {
      message.sendMessageSync.returns({
        status: 'OK'
      });
      const grpcClient = new load.GrpcClient('myHost');
      const unary = grpcClient.unaryRequest({
        method: 'foo',
        protoFile: 'proto',
        headers: {
          Foo: 'Bar'
        },
        bodyArray: [`{foo: 'bar',boo: 1}`]
      });
      unary.sendSync();
      expect(message.sendMessageSync).to.be.calledOnce;
      const sentRequest = message.sendMessageSync.getCall(0).args[2];
      expect(sentRequest.method).to.be.equal('foo');
      expect(sentRequest.bodyArray.toString()).to.be.equal(`{foo: 'bar',boo: 1}`);
    });
  });
  describe('clientStream', () => {
    it('should call gRPC client stream method', () => {
      message.sendMessageSync.returns({
        status: 'OK'
      });
      const grpcClient = new load.GrpcClient('myHost');
      const stream = grpcClient.clientStreamRequest({method: 'foo', protoFile: 'proto', extractors: 'cows'});
      const oldIsExtractor = validators.specific.isExtractor;
      validators.specific.isExtractor = sinon.stub().returns(true);
      const response = stream.sendSync();
      expect(response).to.be.ok;
      expect(response.status).to.be.equal('OK');
      expect(validators.specific.isExtractor).to.have.been.calledOnce;
      validators.specific.isExtractor = oldIsExtractor;
    });

    it('gRPC client should throw error for message LoadError', () => {
      const grpcClient = new load.GrpcClient('myHost');
      const stream = grpcClient.clientStreamRequest({method: 'foo', protoFile: 'proto'});
      expect(() => {
        message.sendMessageSync.returns(new LoadError());
        stream.sendSync();
      }).throw(LoadError);
    });

    it('gRPC client should throw error for message LoadError', () => {
      const grpcClient = new load.GrpcClient('myHost');
      const stream = grpcClient.clientStreamRequest({method: 'foo', protoFile: 'proto'});
      expect(() => {
        message.sendMessageSync.returns(new LoadError('gRPC'));
        stream.sendSync();
      }).throw(LoadError);
    });

    it('should call gRPC client stream with json body array', () => {
      message.sendMessageSync.returns({
        status: 'OK'
      });
      const grpcClient = new load.GrpcClient('myHost');
      const stream = grpcClient.clientStreamRequest({
        method: 'foo',
        protoFile: 'proto',
        headers: {
          Foo: 'Bar'
        },
        body: [{
          foo: 'bar',
          boo: 1
        }, {
          foo: 'foo',
          boo: 2
        }]
      });
      stream.sendSync();
      expect(message.sendMessageSync).to.be.calledOnce;
      const sentRequest = message.sendMessageSync.getCall(0).args[2];
      expect(sentRequest.method).to.be.equal('foo');
      expect(sentRequest.protoFile).to.be.equal('proto');
      expect(sentRequest.body).to.be.eql('[{"foo":"bar","boo":1},{"foo":"foo","boo":2}]');
    });
  });
});
