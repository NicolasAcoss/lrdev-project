'use strict';

const {isString, isFunction, isUndefined} = require('./../../utils/validator.js');
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const charactersLength = characters.length;

function generateName() {
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function addOperation(operationMap, name, operation) {
  if (isFunction(name) && isUndefined(operation)) {
    operation = name;
    name = generateName();
  }
  if (isString(name) && isFunction(operation)) {
    operationMap.set(name, operation);
  }
}

module.exports = (function() {
  const initializers = new Map();
  const finalizers = new Map();
  const actions = new Map();
  return {
    //Adds the given initializer function to the initializers registry
    addInitializer(name, initializer) {
      addOperation(initializers, name, initializer);
    },
    //Adds the given finalizer function to the finalizers registry
    addFinalizer(name, finalizer) {
      addOperation(finalizers, name, finalizer);
    },
    //Adds an action with the given _name_ to the actions registry, if a previous action with the given _name_
    // exists it will be overwritten
    addAction(name, action) {
      addOperation(actions, name, action);
    },
    //Returns the list of all the initializers registered in the same order they were registered
    //of the form {name:func,name:func}
    getInitializers() {
      return new Map(initializers);
    },
    //Returns the list of all the finalizers registered in the same order they were registered
    //of the form {name:func,name:func}
    getFinalizers() {
      return new Map(finalizers);
    },
    //Returns the list of all the actions registered in the same order they were registered, the returned list is
    //of the form {name:func,name:func}
    getActions() {
      return new Map(actions);
    }
  };
})();
