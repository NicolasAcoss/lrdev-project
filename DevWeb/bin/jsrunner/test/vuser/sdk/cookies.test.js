'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const ErrorCodes = require('./../../../vuser/error_codes');

describe('Cookies', () => {
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
    load = proxyquire('./../../../vuser/sdk/cookies.js', {
      './../message.js': message
    })(configStub);
  });

  describe('Cookie', () => {
    it('should create a cookie from options', () => {
      const cookie = new load.Cookie({
        name: 'Monkey',
        value: 'Banana',
        domain: 'alibaba'
      });
      expect(cookie).to.be.ok;
    });

    it('should not create a cookie if options is undefined', () => {
      expect(() => {
        const cookie = new load.Cookie();
        cookie.x = 1;
      }).to.throw('options must be a string or an object but undefined was provided').with.property('code', ErrorCodes.sdk);
    });

    it('should not create a cookie without a name', () => {
      expect(() => {
        const cookie = new load.Cookie({});
        cookie.x = 1;
      }).to.throw('cookie "name", "value" and "domain" must be set').with.property('code', ErrorCodes.sdk);
    });

    describe('from string', () => {
      it('should create a cookie from string', () => {
        const cookie = new load.Cookie('Monkey=Banana; Domain=alibaba');
        expect(cookie).to.be.ok;
        expect(cookie.name).to.be.equal('Monkey');
        expect(cookie.value).to.be.equal('Banana');
        expect(cookie.domain).to.be.equal('alibaba');
      });

      it('should create a cookie from string even if there are extra ;', () => {
        const cookie = new load.Cookie('Monkey=Banana; Domain=alibaba;');
        expect(cookie).to.be.ok;
        expect(cookie.name).to.be.equal('Monkey');
        expect(cookie.value).to.be.equal('Banana');
        expect(cookie.domain).to.be.equal('alibaba');
      });

      it('should create a cookie with secure and httpOnly', () => {
        const cookie = new load.Cookie('Monkey=Banana; Domain=alibaba; secure; httpOnly; max-age=10');
        expect(cookie).to.be.ok;
        expect(cookie.name).to.be.equal('Monkey');
        expect(cookie.value).to.be.equal('Banana');
        expect(cookie.domain).to.be.equal('alibaba');
        expect(cookie.isSecure).to.be.equal(true);
        expect(cookie.isHttpOnly).to.be.equal(true);
        expect(cookie.maxAge).to.be.equal(10);
      });

      it('should create a cookie with expire', () => {
        const cookie = new load.Cookie('Monkey=Banana; Domain=alibaba; secure; httpOnly; expire= tomorrow');
        expect(cookie).to.be.ok;
        expect(cookie.name).to.be.equal('Monkey');
        expect(cookie.value).to.be.equal('Banana');
        expect(cookie.domain).to.be.equal('alibaba');
        expect(cookie.isSecure).to.be.equal(true);
        expect(cookie.isHttpOnly).to.be.equal(true);
        expect(cookie.expire).to.be.equal('tomorrow');
      });
      it('should not create a cookie with incorrect format (name=value)', () => {
        expect(() => {
          const cookie = new load.Cookie('foo;');
          cookie.x = 1;
        }).to.throw('invalid cookie name and value').with.property('code', ErrorCodes.sdk);
      });

      it('should not create a cookie with incorrect format (foo;)', () => {
        expect(() => {
          const cookie = new load.Cookie('id=foo;foo;');
          cookie.x = 1;
        }).to.throw('invalid cookie parameter').with.property('code', ErrorCodes.sdk);
      });
    });
  });

  it('should clear cookies', () => {
    load.clearCookies();
    expect(message.sendMessageSync).to.have.been.calledOnce;
    const type = message.sendMessageSync.firstCall.args[0];
    const content = message.sendMessageSync.firstCall.args[2];
    expect(type).to.be.equal('Cookies.Set');
    expect(content.operation).to.be.equal('clear');
  });

  describe('addCookies', () => {
    it('should add cookies', () => {
      const cookies = [new load.Cookie('foo=bar; Domain=alibaba')];
      load.addCookies(cookies);
      const type = message.sendMessageSync.firstCall.args[0];
      const content = message.sendMessageSync.firstCall.args[2];
      expect(type).to.be.equal('Cookies.Set');
      expect(content.cookies.length).to.be.equal(1);
      expect(content.cookies[0].name).to.be.equal('foo');
      expect(content.cookies[0].value).to.be.equal('bar');
      expect(content.operation).to.be.equal('add');
    });

    it('should take a single cookie', () => {
      const cookie = new load.Cookie('foo=bar; Domain=alibaba');
      load.addCookies(cookie);
      const type = message.sendMessageSync.firstCall.args[0];
      const content = message.sendMessageSync.firstCall.args[2];
      expect(type).to.be.equal('Cookies.Set');
      expect(content.cookies.length).to.be.equal(1);
      expect(content.cookies[0].name).to.be.equal('foo');
      expect(content.cookies[0].value).to.be.equal('bar');
    });
  });

  describe('deleteCookies', () => {
    it('should delete cookies', () => {
      const cookies = [new load.Cookie('foo=bar; Domain=alibaba')];
      load.deleteCookies(cookies);
      const type = message.sendMessageSync.firstCall.args[0];
      const content = message.sendMessageSync.firstCall.args[2];
      expect(type).to.be.equal('Cookies.Set');
      expect(content.cookies.length).to.be.equal(1);
      expect(content.cookies[0].name).to.be.equal('foo');
      expect(content.cookies[0].value).to.be.equal('bar');
      expect(content.operation).to.be.equal('delete');
    });
  });
});