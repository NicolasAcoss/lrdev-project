'use strict';

const {isString, isEmpty, isUndefined, isNil, isNumber, isInteger, isArray} = require('./../../utils/validator.js');
const message = require('./../message.js');
const {LoadError, ErrorTypes} = require('./../load_error.js');
const ErrorCodes = require('./../error_codes.js');

function verifyRowIndex(rowIndex) {
  if (!isNumber(rowIndex) || Number(rowIndex) < 0) {
    throw new LoadError(ErrorTypes.vts, `Row index must be a non negative number but ${rowIndex} was sent`, null, ErrorCodes.sdk);
  }
}

module.exports = function(load) {
  const VTSPlacementType = {
    sameRow: 'VTSEND_SAME_ROW',
    stacked: 'VTSEND_STACKED',
    unique: 'VTSEND_STACKED_UNIQUE'
  };

  class Column {
    constructor(client, name) {
      this.client = client;
      this.name = name;
    }

    clear() { //lrvtc_clear_column
      const response = message.sendMessageSync('VTS.Column.Clear', load.config.user.userId, {
        connectionId: this.client.connectionId,
        columnName: this.name
      });

      if (response instanceof LoadError) {
        response.message = `Error while clearing the column ${this.name}, error: ${response.message}`;
        throw response;
      } else {
        return null;
      }
    }

    size() { //lrvtc_column_size
      const response = message.sendMessageSync('VTS.Column.Size', load.config.user.userId, {
        connectionId: this.client.connectionId,
        columnName: this.name
      });

      if (response instanceof LoadError) {
        response.message = `Error while retrieving size of column ${this.name}, error: ${response.message}`;
        throw response;
      } else {
        return response;
      }
    }

    dropIndex() { //lrvtc_drop_index
      const response = message.sendMessageSync('VTS.Column.DropIndex', load.config.user.userId, {
        connectionId: this.client.connectionId,
        columnName: this.name
      });

      if (response instanceof LoadError) {
        response.message = `Error while dropping index of column ${this.name}, error: ${response.message}`;
        throw response;
      } else {
        return null;
      }
    }

    createIndex() { //lrvtc_ensure_index
      const response = message.sendMessageSync('VTS.Column.CreateIndex', load.config.user.userId, {
        connectionId: this.client.connectionId,
        columnName: this.name
      });

      if (response instanceof LoadError) {
        response.message = `Error while creating index of column ${this.name}, error: ${response.message}`;
        throw response;
      } else {
        return null;
      }
    }

    addValue(value, ifUnique) { //lrvtc_send_message
      if (!isString(value)) {
        throw new LoadError(ErrorTypes.vts, `Error while adding a value in the column ${this.name}, error: value must be a string but ${value} was sent`, null, ErrorCodes.sdk);
      }
      let response;
      if (ifUnique) {
        response = message.sendMessageSync('VTS.Column.AddUnique', load.config.user.userId, {
          connectionId: this.client.connectionId,
          columnName: this.name,
          value
        });
      } else {
        response = message.sendMessageSync('VTS.Column.SetValue', load.config.user.userId, {
          connectionId: this.client.connectionId,
          columnName: this.name,
          value
        });
      }

      if (response instanceof LoadError) {
        response.message = `Error while adding a value in the column ${this.name}, error: ${response.message}`;
        throw response;
      } else {
        return null;
      }
    }

    //---- Field functions
    clearField(rowIndex) { //lrvtc_clear_message
      verifyRowIndex(rowIndex);
      const response = message.sendMessageSync('VTS.Field.Clear', load.config.user.userId, {
        connectionId: this.client.connectionId,
        columnName: this.name,
        rowIndex
      });

      if (response instanceof LoadError) {
        response.message = `Error while clearing the field at column ${this.name} row ${rowIndex}, error: ${response.message}`;
        throw response;
      } else {
        return null;
      }
    }

    incrementField(rowIndex, value) { //lrvtc_increment
      verifyRowIndex(rowIndex);
      if (!isInteger(value)) {
        throw new LoadError(ErrorTypes.vts, `Error while incrementing the field at column ${this.name} row ${rowIndex}, error: value must must be an integer but ${value} was sent`, null, ErrorCodes.sdk);
      }
      const response = message.sendMessageSync('VTS.Field.Increment', load.config.user.userId, {
        connectionId: this.client.connectionId,
        columnName: this.name,
        rowIndex,
        value
      });

      if (response instanceof LoadError) {
        response.message = `Error while incrementing the field at column ${this.name} row ${rowIndex}, error: ${response.message}`;
        throw response;
      } else {
        return response;
      }
    }

    getFieldValue(rowIndex) { //lrvtc_query_column
      verifyRowIndex(rowIndex);
      const response = message.sendMessageSync('VTS.Field.GetValue', load.config.user.userId, {
        connectionId: this.client.connectionId,
        columnName: this.name,
        rowIndex
      });

      if (response instanceof LoadError) {
        response.message = `Error while getting a value from the field at column ${this.name} row ${rowIndex}, error: ${response.message}`;
        throw response;
      } else {
        return response[this.name];
      }
    }

    setFieldValue(rowIndex, value, existingValue) { //lrvtc_update_message and lrvtc_update_message_ifequals
      // if existingValue is defined then set only if the existing value on the server is equal to the given value
      verifyRowIndex(rowIndex);
      if (!isString(value)) {
        throw new LoadError(ErrorTypes.vts, `Error while setting the value for the field at column ${this.name} row ${rowIndex}, error: value must be a string but ${value} was sent`, null, ErrorCodes.sdk);
      }

      if (!isString(existingValue) && !isUndefined(existingValue)) {
        throw new LoadError(ErrorTypes.vts, `Error while setting the value for the field at column ${this.name} row ${rowIndex}, error: existing value must be a string but ${existingValue} was sent`, null, ErrorCodes.sdk);
      }

      const response = message.sendMessageSync('VTS.Field.SetValue', load.config.user.userId, {
        connectionId: this.client.connectionId,
        columnName: this.name,
        rowIndex,
        value,
        condition: existingValue
      });

      if (response instanceof LoadError) {
        response.message = `Error while setting the value for the field at column ${this.name} row ${rowIndex}, error: ${response.message}`;
        throw response;
      } else {
        return null;
      }
    }

    pop() {
      const result = this.client.popColumns([this.name]);
      return result[this.name];
    }

    rotate(placementType) {
      if (!Object.values(VTSPlacementType).includes(placementType)) {
        throw new LoadError(ErrorTypes.vts, `Error while rotating a value in the column ${this.name}, error: placement type must be one of ${Object.values(VTSPlacementType)} but ${placementType} was sent`, null, ErrorCodes.sdk);
      }

      const result = this.client.rotateColumns([this.name], placementType);
      return result[this.name];
    }
  }

  class Row {
    constructor(client, index) {
      this.client = client;
      this.index = index;
    }

    clear() { //lrvtc_clear_row
      const response = message.sendMessageSync('VTS.Row.Clear', load.config.user.userId, {
        connectionId: this.client.connectionId,
        rowIndex: this.index
      });

      if (response instanceof LoadError) {
        response.message = `Error while clearing the row ${this.index}, error: ${response.message}`;
        throw response;
      } else {
        return null;
      }
    }

    getValues() { //lrvtc_query_row
      const response = message.sendMessageSync('VTS.Row.GetValues', load.config.user.userId, {
        connectionId: this.client.connectionId,
        rowIndex: this.index
      });

      if (response instanceof LoadError) {
        response.message = `Error while getting values from the row ${this.index}, error: ${response.message}`;
        throw response;
      } else {
        return response;
      }
    }

    setValues(columnNames, values) { //lrvtc_update_row1
      if (!isArray(columnNames)) {
        throw new LoadError(ErrorTypes.vts, `Error while setting values in the row ${this.index}, error: column names must be an array`, null, ErrorCodes.sdk);
      }

      if (!isArray(values)) {
        throw new LoadError(ErrorTypes.vts, `Error while setting values in the row ${this.index}, error: values must be an array`, null, ErrorCodes.sdk);
      }

      if (values.length !== columnNames.length) {
        throw new LoadError(ErrorTypes.vts, `Error while setting values in the row ${this.index}, error: column names, and values arrays must be of the same length`, null, ErrorCodes.sdk);
      }

      const response = message.sendMessageSync('VTS.Row.SetValues', load.config.user.userId, {
        connectionId: this.client.connectionId,
        columnNames,
        values
      });

      if (response instanceof LoadError) {
        response.message = `Error while setting values in the row ${this.index}, error: ${response.message}`;
        throw response;
      } else {
        return null;
      }
    }
  }

  class Client {
    constructor(options) {
      Object.assign(this, options);
    }

    getColumn(columnName) {
      if (isEmpty(columnName)) {
        throw new LoadError(ErrorTypes.vts, `Column name must not be empty but ${columnName} was sent`, null, ErrorCodes.sdk);
      }
      return new Column(this, columnName);
    }

    getRow(rowIndex) {
      verifyRowIndex(rowIndex);
      return new Row(this, rowIndex);
    }

    createColumn(columnName) { //lrvtc_create_column
      if (isEmpty(columnName)) {
        throw new LoadError(ErrorTypes.vts, `Error while creating a column, error: column name must not be empty but ${columnName} was sent`, null, ErrorCodes.sdk);
      }
      const response = message.sendMessageSync('VTS.Client.CreateColumn', load.config.user.userId, {
        connectionId: this.connectionId,
        columnName
      });

      if (response instanceof LoadError) {
        response.message = `Error while creating the column ${columnName}, error: ${response.message}`;
        throw response;
      } else {
        return this.getColumn(columnName);
      }
    }

    popColumns(columnNames) { //lrvtc_retrieve_messages1, pops all columns for undefined array (lrvtc_retrieve_row), also the same as lrvtc_retrieve_message with one value
      if (!(isNil(columnNames) || isArray(columnNames))) {
        throw new LoadError(ErrorTypes.vts, `Error while popping values from columns, error: column names must be an array or null (for the entire row)`, null, ErrorCodes.sdk);
      }

      const response = message.sendMessageSync('VTS.Client.PopColumns', load.config.user.userId, {
        connectionId: this.connectionId,
        columnNames
      });

      if (response instanceof LoadError) {
        response.message = `Error while popping values from columns, error: ${response.message}`;
        throw response;
      } else {
        return response;
      }
    }

    rotateColumns(columnNames, placementType) { //lrvtc_rotate_message, lrvtc_rotate_message1, lrvtc_rotate_row with same logic as popColumns
      if (!(isNil(columnNames) || isArray(columnNames))) {
        throw new LoadError(ErrorTypes.vts, `Error while rotating values from columns, error: column names must be an array or null (for the entire row)`, null, ErrorCodes.sdk);
      }

      if (!Object.values(VTSPlacementType).includes(placementType)) {
        throw new LoadError(ErrorTypes.vts, `Error while rotating values from columns, error: placement type must be one of ${Object.values(VTSPlacementType)} but ${placementType} was sent`, null, ErrorCodes.sdk);
      }

      const response = message.sendMessageSync('VTS.Client.RotateColumns', load.config.user.userId, {
        connectionId: this.connectionId,
        columnNames,
        placementType
      });

      if (response instanceof LoadError) {
        response.message = `Error while rotating values from columns, error: ${response.message}`;
        throw response;
      } else {
        return response;
      }
    }

    setValues(columnNames, values, placementType) { //lrvtc_send_row1
      if (!isArray(columnNames)) {
        throw new LoadError(ErrorTypes.vts, `Error while setting values in columns, error: column names must be an array`, null, ErrorCodes.sdk);
      }

      if (!isArray(values)) {
        throw new LoadError(ErrorTypes.vts, `Error while setting values in columns, error: values must be an array`, null, ErrorCodes.sdk);
      }

      if (values.length !== columnNames.length) {
        throw new LoadError(ErrorTypes.vts, `Error while setting values in columns, error: column names and values arrays must be of the same length`, null, ErrorCodes.sdk);
      }

      if (!Object.values(VTSPlacementType).includes(placementType)) {
        throw new LoadError(ErrorTypes.vts, `Error while setting values in columns, error: placement type must be one of ${Object.values(VTSPlacementType)} but ${placementType} was sent`, null, ErrorCodes.sdk);
      }

      const response = message.sendMessageSync('VTS.Client.SetValues', load.config.user.userId, {
        connectionId: this.connectionId,
        columnNames,
        values,
        placementType
      });

      if (response instanceof LoadError) {
        response.message = `Error while setting values in columns, error: ${response.message}`;
        throw response;
      } else {
        return response;
      }
    }

    replaceExistingValue(columnNames, newValue, existingValue) { //lrvtc_update_message_ifequals
      if (!isArray(columnNames)) {
        throw new LoadError(ErrorTypes.vts, `Error while replacing a value in columns, error: column names must be an array`, null, ErrorCodes.sdk);
      }

      if (!isString(newValue)) {
        throw new LoadError(ErrorTypes.vts, `Error while replacing a value in columns, error: value must be a string but ${newValue} was sent`, null, ErrorCodes.sdk);
      }

      if (!isString(existingValue)) {
        throw new LoadError(ErrorTypes.vts, `Error while replacing a value in columns, error: existing value must be a string but ${existingValue} was sent`, null, ErrorCodes.sdk);
      }

      const response = message.sendMessageSync('VTS.Client.ReplaceExistingValue', load.config.user.userId, {
        connectionId: this.connectionId,
        columnNames,
        newValue,
        existingValue
      });

      if (response instanceof LoadError) {
        response.message = `Error while replacing a value in columns, error: ${response.message}`;
        throw response;
      } else {
        return response;
      }
    }

    searchRows(columnNames, values, delimiter) { // lrvtc_search_rows
      if (!isArray(columnNames)) {
        throw new LoadError(ErrorTypes.vts, `Error while searching values in columns, error: column names must be an array`, null, ErrorCodes.sdk);
      }

      if (!isArray(values)) {
        throw new LoadError(ErrorTypes.vts, `Error while searching values in columns, error: values must be an array`, null, ErrorCodes.sdk);
      }

      if (values.length !== columnNames.length) {
        throw new LoadError(ErrorTypes.vts, `Error while searching values in columns, error: column names and values arrays must be of the same length`, null, ErrorCodes.sdk);
      }

      if (!delimiter) {
        throw new LoadError(ErrorTypes.vts, 'Error while searching values in columns, error: delimiter must be non-empty string', null, ErrorCodes.sdk);
      }

      const response = message.sendMessageSync('VTS.Client.SearchRows', load.config.user.userId, {
        connectionId: this.connectionId,
        columnNames,
        values,
        delimiter
      });

      if (response instanceof LoadError) {
        response.message = `Error while searching values in rows, error: ${response.message}`;
        throw response;
      } else {
        return response;
      }
    }
  }

  return {
    VTSPlacementType,
    vtsConnect(options) { //lrvtc_connect_ex
      if (isEmpty(options.server) || isNil(options.port)) {
        throw new LoadError(ErrorTypes.vts, `VTS connection must contain server and port properties but ${JSON.stringify(options)} was sent`, null, ErrorCodes.sdk);
      }
      const response = message.sendMessageSync('VTS.Connect', load.config.user.userId, options);

      if (response instanceof LoadError) {
        response.message = `Could not connect to VTS server, error: ${response.message}`;
        throw response;
      } else {
        return new Client(Object.assign({}, options, response));
      }
    }
  };
};
