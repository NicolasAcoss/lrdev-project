'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const {LoadError} = require('./../../../vuser/load_error.js');
const ErrorCodes = require('./../../../vuser/error_codes');
chai.use(sinonChai);

describe('Utils', () => {
  let load;
  let message;

  beforeEach(() => {
    message = {
      sendMessageSync: sinon.stub()
    };
    const configStub = {
      config: {
        user: {
          userId: 10
        }
      }
    };
    load = proxyquire('./../../../vuser/sdk/utils.js', {
      './../message.js': message
    })(configStub);
    configStub.utils = load.utils;
  });

  describe('getByBoundary', () => {
    it('should return a value between two boundaries', () => {
      const result = load.utils.getByBoundary('AAFooBBgjhgfjhgf', 'AA', 'BB');
      expect(result).to.be.equal('Foo');
    });

    it('should not return a value between two boundaries if left doesnt exist', () => {
      const result = load.utils.getByBoundary('AAFooBB', 'AB', 'BB');
      expect(result).to.be.equal(null);
    });

    it('should not return a value between two boundaries if Right doesnt exist', () => {
      const result = load.utils.getByBoundary('AAFooBB', 'AA', 'AB');
      expect(result).to.be.equal(null);
    });

    it('should return everything after the left boundary if right boundary is undefined', () => {
      const result = load.utils.getByBoundary('AAFooBB', 'AA', undefined);
      expect(result).to.be.equal('FooBB');
    });

    it('should return everything before the right boundary if left boundary is undefined', () => {
      const result = load.utils.getByBoundary('AAFooBB', undefined, 'AA');
      expect(result).to.be.equal('');
    });

    it('should return null if no source was provided', () => {
      const result = load.utils.getByBoundary();
      expect(result).to.be.equal(null);
    });
  });

  describe('reportDataPoint', () => {
    it('should report a data point', () => {
      load.utils.reportDataPoint('foo', 1);
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('should not report a data point with no name', () => {
      expect(() => {
        load.utils.reportDataPoint('', 1);
      }).to.throw('data point name must not be empty').with.property('code', ErrorCodes.sdk);
    });

    it('should not report a data point with invalid value', () => {
      expect(() => {
        load.utils.reportDataPoint('monkey', 'banana');
      }).to.throw('the value for data point monkey must be a number but banana was sent').with.property('code', ErrorCodes.sdk);
    });
  });

  describe('util function', () => {
    it('should base64Encode', () => {
      message.sendMessageSync.returns({value: 'abc'});
      load.utils.base64Encode('foo');
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('should base64Encode with options', () => {
      message.sendMessageSync.returns({value: 'abc'});
      load.utils.base64Encode('foo', {base64URL: false, noPadding: false});
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('should throw error for no value for base64Encode', () => {
      expect(() => {
        load.utils.base64Encode('');
      }).to.throw('value must not be empty').with.property('code', ErrorCodes.sdk);
    });

    it('base64Encode should throw error for message LoadError', () => {
      expect(() => {
        message.sendMessageSync.returns(new LoadError());
        load.utils.base64Encode('foo');
      }).to.throw(LoadError);
    });

    it('should throw error for not valid charset for base64Encode', () => {
      expect(() => {
        load.utils.base64Encode('hello', {charset: 123});
      }).to.throw('the charset for base64Encode must be a string but 123 was sent').with.property('code', ErrorCodes.sdk);
    });

    it('should base64Decode', () => {
      message.sendMessageSync.returns({value: 'abc'});
      load.utils.base64Decode('a3VrdQ==');
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('should base64Decode with options', () => {
      message.sendMessageSync.returns({value: 'abc'});
      load.utils.base64Decode('a3VrdQ==', {base64URL: false, noPadding: false});
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('should base64Decode with binary response', () => {
      message.sendMessageSync.returns({
        value: Buffer.from('abc').toString('base64')
      });
      const data = load.utils.base64Decode('a3VrdQ==', {isBinaryContent: true});
      expect(message.sendMessageSync).to.have.been.calledOnce;
      expect(Buffer.isBuffer(data)).to.be.true;
      expect(data.toString('ascii')).to.be.equal('abc');
    });

    it('should throw error for no value for base64Decode', () => {
      expect(() => {
        load.utils.base64Decode('');
      }).to.throw('value must not be empty').with.property('code', ErrorCodes.sdk);
    });

    it('should throw error for not valid charset for base64Decode', () => {
      expect(() => {
        load.utils.base64Decode('aGVsbG8=', {charset: 123});
      }).to.throw('the charset for base64Decode must be a string but 123 was sent').with.property('code', ErrorCodes.sdk);
    });

    it('should throw if the response was an error for base64Decode', () => {
      message.sendMessageSync.returns(new LoadError('a', 'b', 'c', 678));
      expect(() => {
        load.utils.base64Decode('abc');
      }).to.throw('b').with.property('code', 678);
    });

    it('should randomString', () => {
      message.sendMessageSync.returns({value: 'abc'});
      load.utils.randomString(5);
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('should randomString with options', () => {
      message.sendMessageSync.returns({value: 'abc'});
      load.utils.randomString(5, {
        custom: 'aa'
      });
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('should throw error empty custom character', () => {
      message.sendMessageSync.returns({value: 'abc'});
      expect(() => {
        load.utils.randomString(5, {custom: ''});
      }).to.throw('random string options custom custom character set could not be empty').with.property('code', ErrorCodes.sdk);
    });

    it('should throw error for non number size for randomString', () => {
      expect(() => {
        load.utils.randomString('a');
      }).to.throw('the size of random string must be a number but a was sent').with.property('code', ErrorCodes.sdk);
    });

    it('should throw error for negative size for randomString', () => {
      expect(() => {
        load.utils.randomString(-1);
      }).to.throw('the size of random string must be greater than 0').with.property('code', ErrorCodes.sdk);
    });

    it('randomString should throw error for message LoadError', () => {
      expect(() => {
        message.sendMessageSync.returns(new LoadError());
        load.utils.randomString(2);
      }).to.throw(LoadError);
    });

    it('should uuid', () => {
      message.sendMessageSync.returns({value: 'abc'});
      load.utils.uuid();
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('uuid should throw error for message LoadError', () => {
      expect(() => {
        message.sendMessageSync.returns(new LoadError());
        load.utils.uuid();
      }).to.throw(LoadError);
    });

    it('should call hash function', () => {
      message.sendMessageSync.returns({value: 'abc'});
      load.utils.hash(load.HashAlgorithm.sha256, 'hello');
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('hash should throw error for message LoadError', () => {
      expect(() => {
        message.sendMessageSync.returns(new LoadError());
        load.utils.hash(load.HashAlgorithm.sha256, 'hello');
      }).to.throw(LoadError);
    });

    it('should call hash function of value, options notation', () => {
      message.sendMessageSync.returns({value: 'abc'});
      load.utils.hash('hello', {
        algorithm: load.HashAlgorithm.sha256
      });
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('should throw error for empty input for hash', () => {
      expect(() => {
        load.utils.hash(load.HashAlgorithm.sha256, '', load.HashOutputEncoding.base64RawURL);
      }).to.throw('input cannot be empty').with.property('code', ErrorCodes.sdk);
    });

    it('should throw error for empty algorithm for hash', () => {
      expect(() => {
        load.utils.hash('', '');
      }).to.throw('algorithm cannot be empty').with.property('code', ErrorCodes.sdk);
    });

    it('should call hmac function', () => {
      message.sendMessageSync.returns({value: 'abc'});
      load.utils.hmac(load.HashAlgorithm.sha256, 'secret', 'hello');
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('hmac should throw error for message LoadError', () => {
      expect(() => {
        message.sendMessageSync.returns(new LoadError());
        load.utils.hmac(load.HashAlgorithm.sha256, 'secret', 'hello');
      }).to.throw(LoadError);
    });

    it('should call hmac function of value,options notation', () => {
      message.sendMessageSync.returns({value: 'abc'});
      load.utils.hmac('hello', {
        algorithm: load.HashAlgorithm.sha256,
        secret: 'secret'
      });
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('should throw error for empty input for hmac', () => {
      expect(() => {
        load.utils.hmac(load.HashAlgorithm.sha256, 'secret', '');
      }).to.throw('input cannot be empty').with.property('code', ErrorCodes.sdk);
    });

    it('should throw error for empty secret for hmac', () => {
      expect(() => {
        load.utils.hmac(load.HashAlgorithm.sha256, '', 'cow');
      }).to.throw('secret cannot be empty').with.property('code', ErrorCodes.sdk);
    });

    it('should throw error for empty algorithm for hmac', () => {
      expect(() => {
        load.utils.hmac('', 'secret', '');
      }).to.throw('algorithm cannot be empty').with.property('code', ErrorCodes.sdk);
    });

    it('should throw error for invalid secret for hmac', () => {
      expect(() => {
        load.utils.hmac('md5', 123, 'hello');
      }).to.throw('secret of HMAC must be a string but 123 was sent').with.property('code', ErrorCodes.sdk);
    });

    it('should samlEncode', () => {
      message.sendMessageSync.returns({value: 'a3VrdQ=='});
      load.utils.samlEncode('abc');
      expect(message.sendMessageSync).to.have.been.calledOnce;
    });

    it('should throw error for empty samlEncode', () => {
      message.sendMessageSync.returns({value: 'a3VrdQ=='});
      expect(() => {
        load.utils.samlEncode();
      }).to.throw('value must not be empty').with.property('code', ErrorCodes.sdk);
    });

    it('samlEncode should throw error for message LoadError', () => {
      expect(() => {
        message.sendMessageSync.returns(new LoadError());
        load.utils.samlEncode('abc');
      }).to.throw(LoadError);
    });

    it('should generate totp code', () => {
      message.sendMessageSync.returns({value: '551971'});
      load.utils.totp('I am a secret', 59000, {algorithm: load.HashAlgorithm.sha256, digits: 8});
      expect(message.sendMessageSync).to.have.been.calledOnce;
      load.utils.totp('I am a secret', 59000);
      expect(message.sendMessageSync).to.have.been.calledTwice;
    });

    it('should throw error for invalid totp mandatory arguments', () => {
      expect(() => {
        load.utils.totp(1, 59000);
      }).to.throw('secret must be a string').with.property('code', ErrorCodes.sdk);
      expect(() => {
        load.utils.totp('I am a secret', 'timestamp');
      }).to.throw('timestamp must be unix time (UnixMillis)').with.property('code', ErrorCodes.sdk);
    });

    it('should throw error for invalid totp options', () => {
      expect(() => {
        load.utils.totp('I am a secret', 59000, {digits: 0});
      }).to.throw('TOTP digits option must be a positive integer bigger than 3 but 0 was sent').with.property('code', ErrorCodes.sdk);
      expect(() => {
        load.utils.totp('I am a secret', 59000, {skew: -1});
      }).to.throw('TOTP skew option must be a non-negative integer but -1 [number] was sent').with.property('code', ErrorCodes.sdk);
      expect(() => {
        load.utils.totp('I am a secret', 59000, {period: '0'});
      }).to.throw('TOTP period option must be a positive integer but 0 [string] was sent').with.property('code', ErrorCodes.sdk);
      expect(() => {
        load.utils.totp('I am a secret', 59000, {algorithm: 'blah'});
      }).to.throw('invalid TOTP Hash algorithm type \'blah\'. The valid values are: sha1, sha256, sha512, md5').with.property('code', ErrorCodes.sdk);
    });

    describe('Chain', () => {
      it('should chain several functions', () => {
        message.sendMessageSync.returns({value: 'abc'});
        const chain = new load.utils.Chain('uuid', load.utils.base64Encode, {
          charset: ''
        });
        chain.run(null);
        expect(message.sendMessageSync).to.have.been.calledTwice;
      });

      it('should chain return the same value if nothing is chained', () => {
        const result = new load.utils.Chain().run('foo');
        expect(result).to.be.equal('foo');
      });

      it('should throw if chained invalid function', () => {
        expect(() => {
          const obj = new load.utils.Chain('bar', null, load.utils.base64Encode, {
            charset: ''
          });
          expect(obj).to.not.be.ok;
        }).to.throw('Could not find a function bar (argument #1)').with.property('code', ErrorCodes.sdk_logic);
      });
    });
  });
});