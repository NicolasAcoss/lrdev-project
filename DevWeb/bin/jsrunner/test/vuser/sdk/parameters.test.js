'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

describe('Parameters', () => {
  let load;
  let message;

  it('should create parameters variables on load.params based on the server response', () => {
    message = {
      sendMessageSync: sinon.stub().returns(
        [
          {
            name: 'myParam',
            iteration: 1
          },
          {
            name: 'myParam2',
            iteration: 2
          }
        ]
      )
    };

    const configStub = {
      config: {
        user: {
          userId: 10
        },
        runtime: {
          iteration: 1
        }
      },
      log: sinon.stub()
    };

    load = proxyquire('./../../../vuser/sdk/parameters.js', {

      './../message.js': message
    })(configStub);

    const params = load.initializeParams();
    expect(params.myParam).to.be.ok;
    message.sendMessageSync.returns('myParam2');
    const value = params.myParam2;
    expect(value).to.be.equal('myParam2');
  });
});