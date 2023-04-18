'use strict';

const flowRegistry = require('./flow_registry.js');
const {isNil, isEmpty, isUndefined} = require('./../../utils/validator.js');
function runFlow(mapOfFunctions, flow) {
  let values = [];
  if (isUndefined(flow) || isNil(flow)) {
    //This step should work for non run logic scripts
    values = Array.from(mapOfFunctions);
  } else {
    if (isEmpty(flow)) {
      values = [];
    } else {
      flow.forEach((key) => {
        if (!mapOfFunctions.has(key)) {
          throw new Error(`invalid function name: '${key}'`);
        }
        const newVar = mapOfFunctions.get(key);
        values.push([key, newVar]);
      });
    }
  }

  return values.reduce((prev, current) => {
    return prev.then(() => {
      return current[1]();
    });
  }, Promise.resolve());
}

module.exports = {
  initialize(flow) {
    const initializers = flowRegistry.getInitializers();
    return runFlow(initializers, flow);
  },

  action(flow) {
    const actions = flowRegistry.getActions();
    return runFlow(actions, flow);
  },

  finalize(flow) {
    const finalizers = flowRegistry.getFinalizers();
    return runFlow(finalizers, flow);
  }
};
