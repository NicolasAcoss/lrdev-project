'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const ErrorCodes = require('./../../../vuser/error_codes');

const {LoadError, ErrorTypes} = require('./../../../vuser/load_error.js');

function getError(message) {
  return new LoadError(ErrorTypes.vts, message, null, ErrorCodes.sdk);
}

describe('VTS', () => {
  let load;
  let message;
  let tempClient;

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
    load = proxyquire('./../../../vuser/sdk/vts.js', {
      './../message.js': message
    })(configStub);
  });
  describe('Internal', () => {
    beforeEach(() => {
      message.sendMessageSync.returns({});
      tempClient = load.vtsConnect({
        server: 'my server',
        port: 12345
      });
    });
    describe('Column', () => {
      it('should create a column', () => {
        const column = tempClient.getColumn('Foo');
        expect(column).to.be.ok;
        expect(column.name).to.be.equal('Foo');
        expect(column.client).to.be.equal(tempClient);
      });

      it('should clear a column', () => {
        const column = tempClient.getColumn('Foo');
        const result = column.clear();
        expect(result).to.be.null;
      });

      it('should clear a column with error', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns(getError('foo'));
        expect(() => {
          column.clear();
        }).to.throw('Error while clearing the column Foo');
      });

      it('should size a column', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns('foo');
        const result = column.size();
        expect(result).to.be.equal('foo');
      });

      it('should size a column with error', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns(getError('foo'));
        expect(() => {
          column.size();
        }).to.throw('Error while retrieving size of column').with.property('code', ErrorCodes.sdk);
      });

      it('should dropIndex a column', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns({});
        const result = column.dropIndex();
        expect(result).to.be.null;
      });

      it('should dropIndex a column with error', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns(getError('foo'));
        expect(() => {
          column.dropIndex();
        }).to.throw('Error while dropping index of column').with.property('code', ErrorCodes.sdk);
      });

      it('should createIndex a column', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns({});
        const result = column.createIndex();
        expect(result).to.be.null;
      });

      it('should createIndex a column with error', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns(getError('foo'));
        expect(() => {
          column.createIndex();
        }).to.throw('Error while creating index of column').with.property('code', ErrorCodes.sdk);
      });

      it('should add a unique value to a column', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns({});
        const result = column.addValue('bar', true);
        expect(result).to.be.null;
      });

      it('should add a unique value to a column with error', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns(getError('foo'));
        expect(() => {
          column.addValue('bar', true);
        }).to.throw('Error while adding a value').with.property('code', ErrorCodes.sdk);
      });

      it('should not add incorrect unique value to a column', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns({
          error: 'foo'
        });
        expect(() => {
          column.addValue(123, true);
        }).to.throw('Error while adding a value').with.property('code', ErrorCodes.sdk);
      });

      it('should add a value to a column', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns({});
        const result = column.addValue('bar');
        expect(result).to.be.null;
      });

      it('should set a value to a column with error', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns(getError('foo'));
        expect(() => {
          column.addValue('bar');
        }).to.throw('Error while adding a value in the column').with.property('code', ErrorCodes.sdk);
      });

      it('should not set incorrect value to a column', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns({
          error: 'foo'
        });
        expect(() => {
          column.addValue(123);
        }).to.throw('Error while adding a value in the column').with.property('code', ErrorCodes.sdk);
      });

      it('should pop a column', () => {
        tempClient.popColumns = sinon.stub().returns({Foo: 'a'});
        const column = tempClient.getColumn('Foo');
        const result = column.pop();
        expect(result).to.be.equal('a');
      });

      it('should rotate a column', () => {
        tempClient.rotateColumns = sinon.stub().returns({Foo: 'a'});
        const column = tempClient.getColumn('Foo');
        const result = column.rotate(load.VTSPlacementType.stacked);
        expect(result).to.be.equal('a');
      });

      it('should throw if parameters are wrong when rotate a column', () => {
        tempClient.rotateColumns = sinon.stub().returns({});
        const column = tempClient.getColumn('Foo');
        expect(() => {
          column.rotate('asdasd');
        }).to.throw('Error while rotating a value in the column Foo, error: placement type must be one of VTSEND_SAME_ROW,VTSEND_STACKED,VTSEND_STACKED_UNIQUE but asdasd was sent').with.property('code', ErrorCodes.sdk);
      });

      //Field
      it('should clear a field', () => {
        const column = tempClient.getColumn('Foo');
        const result = column.clearField(1);
        expect(result).to.be.null;
      });

      it('should clear a field with error', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns(getError('foo'));
        expect(() => {
          column.clearField(1);
        }).to.throw('Error while clearing the field at column Foo row 1, error: foo').with.property('code', ErrorCodes.sdk);
      });

      it('should increment a field', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns(2);
        const result = column.incrementField(1, 1);
        expect(result).to.be.equal(2);
      });

      it('should increment a field with error', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns(getError('foo'));
        expect(() => {
          column.incrementField(1, 1);
        }).to.throw('Error while incrementing the field at column Foo row 1, error: foo').with.property('code', ErrorCodes.sdk);
      });

      it('should not increment a field with incorrect input', () => {
        const column = tempClient.getColumn('Foo');
        expect(() => {
          column.incrementField(1, 'Oh no');
        }).to.throw('Error while incrementing the field at column Foo row 1, error: value must must be an integer but Oh no was sent').with.property('code', ErrorCodes.sdk);
      });

      it('should get a value of a field', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns({Foo: 2});
        const result = column.getFieldValue(1);
        expect(result).to.be.equal(2);
      });

      it('should get a value of a field with error', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns(getError('foo'));
        expect(() => {
          column.getFieldValue(1);
        }).to.throw('Error while getting a value from the field at column Foo row 1, error: foo').with.property('code', ErrorCodes.sdk);
      });

      it('should set a value of a field', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns({
          value: 2
        });
        const result = column.setFieldValue(1, '1', 'existing');
        expect(result).to.be.null;
      });

      it('should set a value of a field with error', () => {
        const column = tempClient.getColumn('Foo');
        message.sendMessageSync.returns(getError('foo'));
        expect(() => {
          column.setFieldValue(1, '1');
        }).to.throw('Error while setting the value for the field at column Foo row 1, error: foo').with.property('code', ErrorCodes.sdk);
      });

      it('should not set a value of a field  with incorrect input', () => {
        const column = tempClient.getColumn('Foo');
        expect(() => {
          column.setFieldValue(1, 1);
        }).to.throw('Error while setting the value for the field at column Foo row 1, error: value must be a string but 1 was sent').with.property('code', ErrorCodes.sdk);
        expect(() => {
          column.setFieldValue(1, 'foo', 2);
        }).to.throw('Error while setting the value for the field at column Foo row 1, error: existing value must be a string but 2 was sent').with.property('code', ErrorCodes.sdk);
      });
    });

    describe('Row', () => {
      it('should create a Row', () => {
        const row = tempClient.getRow(1);
        expect(row).to.be.ok;
        expect(row.index).to.be.equal(1);
        expect(row.client).to.be.equal(tempClient);
      });

      it('should clear a row', () => {
        const row = tempClient.getRow(1);
        const result = row.clear();
        expect(result).to.be.null;
      });

      it('should clear a row with error', () => {
        const row = tempClient.getRow(1);
        message.sendMessageSync.returns(getError('foo'));
        expect(() => {
          row.clear();
        }).to.throw('Error while clearing the row 1').with.property('code', ErrorCodes.sdk);
      });

      it('should get values of a row', () => {
        const row = tempClient.getRow(1);
        message.sendMessageSync.returns('foo');
        const result = row.getValues();
        expect(result).to.be.equal('foo');
      });

      it('should get values of a row with error', () => {
        const row = tempClient.getRow(1);
        message.sendMessageSync.returns(getError('foo'));
        expect(() => {
          row.getValues();
        }).to.throw('Error while getting values from the row').with.property('code', ErrorCodes.sdk);
      });

      it('should set values of a row', () => {
        const row = tempClient.getRow(1);
        const result = row.setValues(['foo'], ['bar']);
        expect(result).to.be.null;
      });

      it('should set values of a row with error', () => {
        const row = tempClient.getRow(1);
        message.sendMessageSync.returns(getError('foo'));
        expect(() => {
          row.setValues(['foo'], ['bar']);
        }).to.throw('Error while setting values in the row 1').with.property('code', ErrorCodes.sdk);
      });

      it('should not set values of a row for error params', () => {
        const row = tempClient.getRow(1);
        expect(() => {
          row.setValues('foo', ['bar']);
        }).to.throw('Error while setting values in the row 1, error: column names must be an array').with.property('code', ErrorCodes.sdk);
        expect(() => {
          row.setValues(['foo'], 'bar');
        }).to.throw('Error while setting values in the row 1, error: values must be an array').with.property('code', ErrorCodes.sdk);

        expect(() => {
          row.setValues(['foo'], ['bar', 'baz']);
        }).to.throw('Error while setting values in the row 1, error: column names, and values arrays must be of the same length').with.property('code', ErrorCodes.sdk);
      });
    });
  });

  describe('Client', () => {
    beforeEach(() => {
      message.sendMessageSync.returns({});
      tempClient = load.vtsConnect({
        server: 'my server',
        port: 12345
      });
    });

    it('should not get a Column with incorrect name', () => {
      expect(() => {
        tempClient.getColumn();
      }).to.throw('Column name must not be empty but undefined was sent').with.property('code', ErrorCodes.sdk);
    });

    it('should not get a Row with incorrect index', () => {
      expect(() => {
        tempClient.getRow('A');
      }).to.throw('Row index must be a non negative number but A was sent').with.property('code', ErrorCodes.sdk);
      expect(() => {
        tempClient.getRow(-3);
      }).to.throw('Row index must be a non negative number but -3 was sent').with.property('code', ErrorCodes.sdk);
    });

    it('should create a column', () => {
      message.sendMessageSync.returns({});
      const result = tempClient.createColumn('Foo');
      expect(result.name).to.be.equal('Foo');
    });

    it('should create a column with error', () => {
      message.sendMessageSync.returns(getError('foo'));
      expect(() => {
        tempClient.createColumn('1');
      }).to.throw('Error while creating the column 1, error: foo').with.property('code', ErrorCodes.sdk);
    });

    it('should not create a column with incorrect input', () => {
      expect(() => {
        tempClient.createColumn();
      }).to.throw('Error while creating a column, error: column name must not be empty but undefined was sent').with.property('code', ErrorCodes.sdk);
    });

    it('should pop a column', () => {
      message.sendMessageSync.returns('Baz');
      const result = tempClient.popColumns(['Foo', 'Bar']);
      expect(result).to.be.equal('Baz');
    });

    it('should pop a column with error', () => {
      message.sendMessageSync.returns(getError('foo'));
      expect(() => {
        tempClient.popColumns(['1']);
      }).to.throw('Error while popping values from columns, error: foo').with.property('code', ErrorCodes.sdk);
    });

    it('should not pop a column with incorrect input', () => {
      expect(() => {
        tempClient.popColumns(123);
      }).to.throw('Error while popping values from columns, error: column names must be an array or null (for the entire row)').with.property('code', ErrorCodes.sdk);
    });

    it('should rotate columns', () => {
      message.sendMessageSync.returns('Baz');
      const result = tempClient.rotateColumns(['Foo', 'Bar'], load.VTSPlacementType.sameRow);
      expect(result).to.be.equal('Baz');
    });

    it('should rotate columns with error', () => {
      message.sendMessageSync.returns(getError('foo'));
      expect(() => {
        tempClient.rotateColumns(['1'], load.VTSPlacementType.stacked);
      }).to.throw('Error while rotating values from columns, error: foo').with.property('code', ErrorCodes.sdk);
    });

    it('should not rotate columns with incorrect input', () => {
      expect(() => {
        tempClient.rotateColumns(123);
      }).to.throw('Error while rotating values from columns, error: column names must be an array or null (for the entire row)').with.property('code', ErrorCodes.sdk);
      expect(() => {
        tempClient.rotateColumns(['123']);
      }).to.throw('Error while rotating values from columns, error: placement type must be one of VTSEND_SAME_ROW,VTSEND_STACKED,VTSEND_STACKED_UNIQUE but undefined was sent').with.property('code', ErrorCodes.sdk);
    });

    it('should set values', () => {
      message.sendMessageSync.returns('Baz');
      const result = tempClient.setValues(['Foo', 'Bar'], ['1', '2'], load.VTSPlacementType.sameRow);
      expect(result).to.be.equal('Baz');
    });

    it('should rotate columns with error', () => {
      message.sendMessageSync.returns(getError('foo'));
      expect(() => {
        tempClient.setValues(['1'], ['2'], load.VTSPlacementType.stacked);
      }).to.throw('Error while setting values in columns, error: foo').with.property('code', ErrorCodes.sdk);
    });

    it('should not rotate columns with incorrect input', () => {
      expect(() => {
        tempClient.setValues(123);
      }).to.throw('Error while setting values in columns, error: column names must be an array').with.property('code', ErrorCodes.sdk);
      expect(() => {
        tempClient.setValues(['123']);
      }).to.throw('Error while setting values in columns, error: values must be an array').with.property('code', ErrorCodes.sdk);
      expect(() => {
        tempClient.setValues(['123'], ['234']);
      }).to.throw('Error while setting values in columns, error: placement type must be one of VTSEND_SAME_ROW,VTSEND_STACKED,VTSEND_STACKED_UNIQUE but undefined was sent').with.property('code', ErrorCodes.sdk);
      expect(() => {
        tempClient.setValues(['123'], ['234', 'cow'], load.VTSPlacementType.stacked);
      }).to.throw('Error while setting values in columns, error: column names and values arrays must be of the same length').with.property('code', ErrorCodes.sdk);
    });

    it('should set values with existing value', () => {
      message.sendMessageSync.returns('Baz');
      const result = tempClient.replaceExistingValue(['Foo', 'Bar'], 'foo', 'bar');
      expect(result).to.be.equal('Baz');
    });

    it('should not set values with existing value and incorrect input', () => {
      expect(() => {
        tempClient.replaceExistingValue('no', 'yes', 'bar');
      }).to.throw('Error while replacing a value in columns, error: column names must be an array').with.property('code', ErrorCodes.sdk);

      expect(() => {
        tempClient.replaceExistingValue(['Foo', 'Bar'], 2, 'bar');
      }).to.throw('Error while replacing a value in columns, error: value must be a string but 2 was sent').with.property('code', ErrorCodes.sdk);

      expect(() => {
        tempClient.replaceExistingValue(['Foo', 'Bar'], '2');
      }).to.throw('Error while replacing a value in columns, error: existing value must be a string but undefined was sent').with.property('code', ErrorCodes.sdk);
    });

    it('should handle set values with an error', () => {
      message.sendMessageSync.returns(new LoadError('Baz'));
      expect(() => {
        tempClient.replaceExistingValue(['Foo', 'Bar'], 'foo', 'bar');
      }).to.throw('Error while replacing a value in columns');
    });

    it('should search rows', () => {
      message.sendMessageSync.returns('Baz');
      const result = tempClient.searchRows(['Foo', 'Bar'], ['1', '2'], ',');
      expect(result).to.be.equal('Baz');
    });

    it('should search rows with numeric delimiter', () => {
      message.sendMessageSync.returns('Baz');
      const result = tempClient.searchRows(['Foo', 'Bar'], ['1', '2'], '0');
      expect(result).to.be.equal('Baz');
    });

    it('should handle search rows with an error', () => {
      message.sendMessageSync.returns(new LoadError('Baz', 'Foo'));
      expect(() => {
        tempClient.searchRows(['Foo', 'Bar'], ['1', '2'], ',');
      }).to.throw('Error while searching values in rows, error: Foo');
    });

    it('should not search if columns or values is not array or have different lengths and delimiter undefined', () => {
      expect(() => {
        tempClient.searchRows('Bar', ['1', '2'], ',');
      }).to.throw('Error while searching values in columns, error: column names must be an array').with.property('code', ErrorCodes.sdk);

      expect(() => {
        tempClient.searchRows(['Foo', 'Bar'], '1', ',');
      }).to.throw('Error while searching values in columns, error: values must be an array').with.property('code', ErrorCodes.sdk);

      expect(() => {
        tempClient.searchRows(['Foo', 'Bar'], ['1', '2'], undefined);
      }).to.throw('Error while searching values in columns, error: delimiter must be non-empty string').with.property('code', ErrorCodes.sdk);

      expect(() => {
        tempClient.searchRows(['Foo', 'Bar', 'Har'], ['1', '2'], undefined);
      }).to.throw('Error while searching values in columns, error: column names and values arrays must be of the same length').with.property('code', ErrorCodes.sdk);
    });
  });

  describe('Connect', () => {
    it('should create a client', () => {
      message.sendMessageSync.returns({connectionId: 1});
      const client = load.vtsConnect({
        server: 'my server',
        port: 12345
      });
      expect(client.connectionId).to.be.equal(1);
    });

    it('should not create a connection without server or port', () => {
      expect(() => {
        load.vtsConnect({});
      }).to.throw('VTS connection must contain server and port properties but {} was sent').with.property('code', ErrorCodes.sdk);
    });

    it('should throw if could not connect to server', () => {
      message.sendMessageSync.returns(getError('foo'));
      expect(() => {
        load.vtsConnect({
          server: 'cow',
          port: 1234
        });
      }).to.throw('Could not connect to VTS server, error: foo').with.property('code', ErrorCodes.sdk);
    });
  });
});
