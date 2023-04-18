'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const {LoadError} = require('./../../../vuser/load_error.js');
const validators = require('./../../../utils/validator.js');
chai.use(sinonChai);
const ErrorCodes = require('./../../../vuser/error_codes');

describe('Web Request', () => {
  let load;
  let message;
  let configMock;
  let logUtils;

  beforeEach(() => {
    message = {
      sendMessageSync: sinon.stub(),
      sendMessage: sinon.stub()
    };
    configMock = {
      extractors: {},
      config: {
        user: {
          userId: '1'
        }
      },
      log: sinon.stub()
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

    load = proxyquire('./../../../vuser/sdk/web_request.js', {
      './../utils/request_utils.js': requestUtils,
      './../message.js': message,
      './../utils/log_utils.js': () => logUtils,
      './../../utils/validator.js': validators
    })(configMock);
    configMock.WebRequest = load.WebRequest;
    configMock.WebResponse = load.WebResponse;
  });

  describe('defaults', () => {
    it('should create a web request with defaults', () => {
      const webRequest = new load.WebRequest('www.foo.bar');
      expect(webRequest.method).to.be.equal('GET');
    });

    it('should allow to override defaults', () => {
      load.WebRequest.defaults.method = 'POST';
      const webRequest = new load.WebRequest('www.foo.bar');
      expect(webRequest.method).to.be.equal('POST');
    });

    it('should override defaults with options', () => {
      load.WebRequest.defaults.method = 'POST';
      const webRequest = new load.WebRequest({url: 'www.foo.bar', method: 'PUT'});
      expect(webRequest.method).to.be.equal('PUT');
    });

    it('should deep override defaults', () => {
      load.WebRequest.defaults.headers['MyHeader'] = 'Wow';
      const webRequest = new load.WebRequest('www.foo.bar');
      expect(webRequest.headers['MyHeader']).to.be.equal('Wow');
    });

    it('should deep override defaults with options', () => {
      load.WebRequest.defaults.headers = {
        MyHeader: 'Wow'
      };
      const webRequest = new load.WebRequest({
        url: 'www.foo.bar',
        headers: {
          Foo: 'Bar'
        }
      });
      expect(webRequest.headers['MyHeader']).to.be.equal('Wow');
      expect(webRequest.headers['Foo']).to.be.equal('Bar');
    });
  });
  describe('constructor', () => {
    it('should create a web request with string URL', () => {
      const webRequest = new load.WebRequest('www.foo.bar');
      expect(webRequest.url).to.be.equal('www.foo.bar');
    });

    it('should create a web request with options URL', () => {
      const webRequest = new load.WebRequest({url: 'www.foo.bar'});
      expect(webRequest.url).to.be.equal('www.foo.bar');
    });

    it('should error when there is no URL in options', () => {
      expect(() => {
        const webRequest = new load.WebRequest({method: 'POST'});
        expect(webRequest).to.be.undefined;
      }).to.throw('WebRequest options must have a "url" property').with.property('code', ErrorCodes.sdk);
    });

    it('should error when there is no URL at all', () => {
      expect(() => {
        const webRequest = new load.WebRequest();
        expect(webRequest).to.be.undefined;
      }).to.throw('WebRequest options must have a "url" property').with.property('code', ErrorCodes.sdk);
    });
  });
  describe('sendSync', () => {
    it('should send synchronous message', () => {
      message.sendMessageSync.returns({webResponse: {status: 200 }, webRequestSupplement: {} });
      const request = new load.WebRequest('www.foo.bar');
      const response = request.sendSync();
      expect(response).to.be.ok;
      expect(response.status).to.be.equal(200);
    });

    it('should send synchronous message with extractor', () => {
      message.sendMessageSync.returns({webResponse: {status: 200 }, webRequestSupplement: {} });
      const request = new load.WebRequest({
        url: 'www.foo.bar',
        extractors: 'myExtractor'
      });
      const oldIsExtractor = validators.specific.isExtractor;
      validators.specific.isExtractor = sinon.stub().returns(true);
      const response = request.sendSync();
      expect(response).to.be.ok;
      expect(response.status).to.be.equal(200);
      const sentRequest = message.sendMessageSync.args[0][2];
      expect(sentRequest.extractors.length).to.be.equal(1);
      expect(sentRequest.extractors[0]).to.be.equal('myExtractor');
      expect(validators.specific.isExtractor).to.have.been.calledOnce;
      validators.specific.isExtractor = oldIsExtractor;
    });

    it('should send synchronous message with binary data', () => {
      message.sendMessageSync.returns({webResponse: {status: 200 }, webRequestSupplement: {} });
      const request = new load.WebRequest({
        url: 'www.foo.bar',
        body: Buffer.from('Hello World')
      });
      const response = request.sendSync();
      expect(response).to.be.ok;
      expect(response.status).to.be.equal(200);
      const messagData = message.sendMessageSync.getCall(0).args[2];
      expect(messagData.isBodyBinary).to.be.true;
    });

    it('should send synchronous message with multipart', () => {
      message.sendMessageSync.returns({webResponse: {status: 200 }, webRequestSupplement: {} });
      const request = new load.WebRequest({
        url: 'www.foo.bar',
        body: new load.MultipartBody(['Hello'], 'world')
      });
      const response = request.sendSync();
      expect(response).to.be.ok;
      expect(response.status).to.be.equal(200);
    });

    it('should send WebRequest with json content-type', () => {
      message.sendMessageSync.returns({webResponse: {status: 200 }, webRequestSupplement: {} });
      const request = new load.WebRequest({
        url: 'www.foo.bar',
        headers: {
          Foo: 'Bar',
          'content-type': 'application/json'
        },
        body: {
          foo: 'bar',
          boo: 1
        }
      });
      request.sendSync();
      expect(message.sendMessageSync).to.be.calledOnce;
      const sentRequest = message.sendMessageSync.getCall(0).args[2];
      expect(sentRequest.url).to.be.equal('www.foo.bar');
      expect(sentRequest.body).to.be.eql('{"foo":"bar","boo":1}');
    });

    it('should send WebRequest with json content-type single slash', () => {
      message.sendMessageSync.returns({webResponse: {status: 200 }, webRequestSupplement: {} });
      const request = new load.WebRequest({
        url: 'www.foo.bar',
        headers: {
          Foo: 'Bar',
          'content-type': 'application/json'
        },
        body: {
          one: 'bar1\\/'
        }
      });
      request.sendSync();
      expect(message.sendMessageSync).to.be.calledOnce;
      const sentRequest = message.sendMessageSync.getCall(0).args[2];
      expect(sentRequest.url).to.be.equal('www.foo.bar');
      expect(sentRequest.body).to.be.eql('{"one":"bar1\\/"}');
    });

    it('should send WebRequest with json content-type triple slashes', () => {
      message.sendMessageSync.returns({webResponse: {status: 200 }, webRequestSupplement: {} });
      const request = new load.WebRequest({
        url: 'www.foo.bar',
        headers: {
          Foo: 'Bar',
          'content-type': 'application/json'
        },
        body: {
          one: 'bar1\\\/' // eslint-disable-line
        }
      });
      request.sendSync();
      expect(message.sendMessageSync).to.be.calledOnce;
      const sentRequest = message.sendMessageSync.getCall(0).args[2];
      expect(sentRequest.url).to.be.equal('www.foo.bar');
      expect(sentRequest.body).to.be.eql('{"one":"bar1\\\/"}'); // eslint-disable-line
    });

    it('should send WebRequest with json content-type four slashes', () => {
      message.sendMessageSync.returns({webResponse: {status: 200 }, webRequestSupplement: {} });
      const request = new load.WebRequest({
        url: 'www.foo.bar',
        headers: {
          Foo: 'Bar',
          'content-type': 'application/json'
        },
        body: {
          one: 'bar1\\\\'
        }
      });
      request.sendSync();
      expect(message.sendMessageSync).to.be.calledOnce;
      const sentRequest = message.sendMessageSync.getCall(0).args[2];
      expect(sentRequest.url).to.be.equal('www.foo.bar');
      expect(sentRequest.body).to.be.eql('{"one":"bar1\\\\\\\\"}');
    });

    it('should send WebRequest with json content-type with full header', () => {
      message.sendMessageSync.returns({webResponse: {status: 200 }, webRequestSupplement: {} });
      const request = new load.WebRequest({
        url: 'www.foo.bar',
        headers: {
          Foo: 'Bar',
          'content-type': 'application/json;charset=UTF-8'
        },
        body: {
          foo: 'bar',
          boo: 1
        }
      });
      request.sendSync();
      expect(message.sendMessageSync).to.be.calledOnce;
      const sentRequest = message.sendMessageSync.getCall(0).args[2];
      expect(sentRequest.url).to.be.equal('www.foo.bar');
      expect(sentRequest.body).to.be.eql('{"foo":"bar","boo":1}');
    });

    describe('HTTP or TCP Error', () => {
      it('should fail on SDK error', () => {
        message.sendMessageSync.returns(
          new LoadError('SDK', 'There was an error')
        );

        const request = new load.WebRequest('www.foo.bar');
        expect(() => {
          request.sendSync();
        }).to.throw('There was an error');
      });

      it('should fail on HTTP error without callback', () => {
        message.sendMessageSync.returns(
          new LoadError('HTTP', 'There was an error', {
            web: 'response',
            status: 404
          }, 111
          )
        );

        const request = new load.WebRequest('www.foo.bar');
        expect(() => {
          request.sendSync();
        }).to.throw('HTTP Status-Code=404 for www.foo.bar').with.property('code', 111);
      });

      it('should not fail if a callback is provided and returned false', () => {
        message.sendMessageSync.returns(
          new LoadError('HTTP', 'error',
            {
              web: 'response'
            }
          )
        );

        const request = new load.WebRequest({
          url: 'www.foo.bar',
          handleHTTPError: (response) => {
            expect(response.web).to.be.equal('response');
            response.foo = 'bar';
            return false;
          }
        });
        const webResponse = request.sendSync();
        expect(webResponse.foo).to.be.equal('bar');
      });

      it('should fail if a callback is provided and returned false', () => {
        message.sendMessageSync.returns(
          new LoadError('HTTP', 'error', {
            web: 'response',
            status: 404
          }
          )
        );

        const request = new load.WebRequest({
          url: 'www.foo.bar',
          handleHTTPError: (response) => {
            expect(response.web).to.be.equal('response');
            response.foo = 'bar';
          }
        });

        expect(() => {
          request.sendSync();
        }).to.throw('HTTP Status-Code=404 for www.foo.bar');
      });

      it('should fail with a string error', () => {
        message.sendMessageSync.returns(
          new LoadError('HTTP', 'error', {
            content: {
              web: 'response'
            }
          })
        );

        const request = new load.WebRequest({
          url: 'www.foo.bar',
          handleHTTPError: 'I failed'
        });

        const webResponse = request.sendSync();
        expect(logUtils.internalLog).to.have.been.calledOnce;
        expect(webResponse).to.be.ok;
        expect(webResponse.content.web).to.be.equal('response');
      });
      it('should fail on TCP error', () => {
        message.sendMessageSync.returns(
          new LoadError('TCP', 'There was TCP error', {
            message: 'TCP error'
          })
        );

        const request = new load.WebRequest('www.foo.bar');
        expect(() => {
          request.sendSync();
        }).to.throw('TCP error');
      });
    });
    it('should correctly send a web request with object body and object querystring', () => {
      message.sendMessageSync.returns({webResponse: {status: 200 }, webRequestSupplement: {} });
      const request = new load.WebRequest({
        url: 'www.foo.bar',
        queryString: {
          foo: 'bar',
          bax: ['A', 'B'],
          boo: null
        },
        body: {
          hello: 'world',
          code: 333
        }
      });
      request.sendSync();
      expect(message.sendMessageSync).to.be.calledOnce;
      const sentRequest = message.sendMessageSync.getCall(0).args[2];
      expect(sentRequest.url).to.be.equal('www.foo.bar');
      expect(sentRequest.formBody).to.be.eql([['hello', 'world'], ['code', '333']]);
      expect(sentRequest.queryString).to.be.eql([['foo', 'bar'], ['bax', 'A'], ['bax', 'B'], ['boo', '']]);
    });
  });
  describe('send', () => {
    it('should send an asynchronous message', (done) => {
      message.sendMessage.returns(Promise.resolve({webResponse: {status: 200 }, webRequestSupplement: {} }));
      const request = new load.WebRequest('www.foo.bar');
      request.send().then((response) => {
        expect(response).to.be.ok;
        expect(response.status).to.be.equal(200);
        done();
      });
    });

    it('should fail on SDK error', (done) => {
      message.sendMessage.returns(Promise.reject(
        new LoadError('SDK', 'There was an error')
      ));

      const request = new load.WebRequest('www.foo.bar');

      request.send().then(() => {
        done('Should not get here');
      }, (err) => {
        expect(err).not.to.be.undefined;
        done();
      });
    });
  });
  describe('WebResponse', () => {
    it('should create a web response', () => {
      const response = new load.WebResponse({
        body: 'AA'
      }, {});

      expect(response).to.be.ok;
      expect(response.body).to.be.equal('AA');
    });

    it('should get jsonBody if the body is JSON', () => {
      const response = new load.WebResponse({
        body: JSON.stringify({myObj: 'My'})
      }, {});
      expect(response.jsonBody).to.be.ok;
      expect(response.jsonBody.myObj).to.be.equal('My');
    });

    it('should get jsonBody if the body is JSON with BOM', () => {
      const response = new load.WebResponse({
        body: `\uFEFF${JSON.stringify({myObj: 'unicorn'})}`
      }, {});
      expect(response.jsonBody).to.be.ok;
      expect(response.jsonBody.myObj).to.be.equal('unicorn');
    });

    it('should get undefined jsonBody if body is not a JSON', () => {
      const response = new load.WebResponse({
        body: 'This is not JSON'
      }, {});
      expect(response.jsonBody).to.be.null;
    });

    it('should textCheck with a string', () => {
      const response = new load.WebResponse({
        body: 'This is not JSON'
      }, {});
      expect(response.textCheck('not')).to.be.true;
      expect(response.textCheck('world')).to.be.false;
    });

    it('should textCheck with a regexp', () => {
      const response = new load.WebResponse({
        body: 'This is not JSON'
      }, {});
      expect(response.textCheck(/NOT/i)).to.be.true;
      expect(response.textCheck(/[1]/)).to.be.false;
    });

    it('should not textCheck when there is no body', () => {
      const response = new load.WebResponse({}, {
        url: 'foo'
      });
      expect(() => {
        response.textCheck('aaa');
      }).to.throw('WebRequest (foo) body was not returned. Did you set the "returnBody" property to true?').with.property('code', ErrorCodes.sdk);
    });

    it('should throw if textCheck is not called with a string or a regular expression', () => {
      const response = new load.WebResponse({
        body: 'This is not JSON'
      }, {});

      expect(() => {
        response.textCheck({});
      }).to.throw('textCheck must be called with a string or a regular expression').with.property('code', ErrorCodes.sdk);
    });

    it('should transform an extracted value', () => {
      const extractors = require('./../../../vuser/sdk/extractors')(configMock);
      message.sendMessageSync.returns({webResponse: {extractors: {foo: 'bar'} }, webRequestSupplement: {} });
      const request = new load.WebRequest({
        url: 'www.foo.bar',
        extractors: [
          new extractors.BoundaryExtractor('foo', {
            leftBoundary: 'aa',
            transform: function(value, req, res) {
              expect(value).to.be.equal('bar');
              expect(req).to.be.ok;
              expect(res).to.be.ok;
              return 'milk';
            }
          })
        ]
      });
      const oldIsExtractor = validators.specific.isExtractor;
      validators.specific.isExtractor = sinon.stub().returns(true);
      const response = request.sendSync();
      validators.specific.isExtractor = oldIsExtractor;
      expect(response).to.be.ok;
      expect(response.extractors.foo).to.be.equal('milk');
      expect(configMock.extractors.foo).to.be.equal('milk');
    });

    it('should throw if value validation fails on an extracted value', () => {
      const extractors = require('./../../../vuser/sdk/extractors')(configMock);
      message.sendMessageSync.returns({webResponse: {extractors: {foo: 'bar'} }, webRequestSupplement: {} });
      configMock.ExitType = {iteration: 'iteration'};
      configMock.exit = sinon.stub();
      const request = new load.WebRequest({
        url: 'www.foo.bar',
        extractors: [
          new extractors.BoundaryExtractor('foo', {
            failOn: 'bar',
            leftBoundary: 'aa'
          })
        ]
      });
      request.sendSync();
      expect(configMock.exit).to.have.been.calledWith('iteration', 'Replay aborted by extractor "foo"');
    });
  });
  describe('MultipartBody', () => {
    it('should create a Multipart body', () => {
      const body = new load.MultipartBody(['Hello'], 'world');
      expect(body.entries).to.be.eql(['Hello']);
      expect(body.boundary).to.be.equal('world');
    });

    it('should fail if entries is not an array', () => {
      expect(() => {
        return new load.MultipartBody('Hello', 'world');
      }).to.throw('entries must be an array of multipart entries').with.property('code', ErrorCodes.sdk);
    });

    describe('StringEntry', () => {
      it('should create a string entry', () => {
        const entry = new load.MultipartBody.StringEntry('name', 'value');
        expect(entry.name).to.be.equal('name');
        expect(entry.value).to.be.equal('value');
        expect(entry.entryType).to.be.equal('string');
      });

      it('should throw if name was not a string', () => {
        expect(() => {
          return new load.MultipartBody.StringEntry(123, 'value');
        }).to.throw('name must be a string but').with.property('code', ErrorCodes.sdk);
      });
      it('should throw if value was not a string', () => {
        expect(() => {
          return new load.MultipartBody.StringEntry('123');
        }).to.throw('value must be a string but').with.property('code', ErrorCodes.sdk);
      });
    });

    describe('FileEntry', () => {
      it('should create a file entry', () => {
        const entry = new load.MultipartBody.FileEntry('name', 'filePath', 'contentType', 'fileName');
        expect(entry.name).to.be.equal('name');
        expect(entry.filePath).to.be.equal('filePath');
        expect(entry.contentType).to.be.equal('contentType');
        expect(entry.fileName).to.be.equal('fileName');
        expect(entry.entryType).to.be.equal('file');
      });

      it('should throw if name was not a valid string', () => {
        expect(() => {
          return new load.MultipartBody.FileEntry(123, 'aaaa');
        }).to.throw('name must be a string but').with.property('code', ErrorCodes.sdk);
      });

      it('should throw if filePath was not a valid string', () => {
        expect(() => {
          return new load.MultipartBody.FileEntry('123');
        }).to.throw('filePath must be a string but').with.property('code', ErrorCodes.sdk);
      });
    });

    it('should create multiparts from array of values', () => {
      const body = new load.MultipartBody([
        ['string', 'hello', 'world'],
        ['file', 'foo', 'baz']
      ], 'world');
      expect(body.entries).to.be.eql([
        new load.MultipartBody.StringEntry('hello', 'world'),
        new load.MultipartBody.FileEntry('foo', 'baz')
      ]);
      expect(body.boundary).to.be.equal('world');
    });

    it('should fail if incorrect multipart type was given', () => {
      expect(() => {
        const mpb = new load.MultipartBody([
          ['alibaba', 'hello', 'world']
        ], 'world');
        mpb.foo = 'bar';
      }).to.throw('invalid multipart type alibaba, only \'string\' or \'file\' are allowed');
    });
  });
});
