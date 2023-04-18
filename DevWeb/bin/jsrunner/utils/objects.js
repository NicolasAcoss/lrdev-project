const {isNil} = require('./validator.js');
const cloneDeep = require('./cloneDeep.js');

function startsWith(value, target, position) {
  if (isNil(value)) {
    return false;
  }
  if (value.startsWith === undefined) {
    return false;
  }
  return value.startsWith(target, position);
}

function merge2Objects(target, source, hash = new WeakMap()) {
  if (target === undefined && source !== undefined) {
    return cloneDeep(source);
  }

  if (hash.has(target)) {
    return hash.get(target);
  }

  if (typeof source === 'object') {
    hash.set(target, source);
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (target[key] === undefined) {
          target[key] = cloneDeep(source[key]);
        } else {
          if (
            typeof target[key] === 'object' &&
            typeof source[key] === 'object'
          ) {
            if (Array.isArray(target[key]) && Array.isArray(source[key])) {
              for (let i = target[key].length; i < source[key].length; i++) {
                target[key].push(cloneDeep(source[key][i]));
              }
            } else {
              target[key] = merge2Objects(target[key], source[key], hash);
            }
          }
        }
      }
    }
  }
  return target;
}
function mergeObjects(target, ...sources) {
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    merge2Objects(target, source);
  }
  return target;
}

function defaultsDeep(target, ...objects) {
  return mergeObjects(target, ...objects);
}

module.exports = {
  cloneDeep,
  startsWith,
  defaultsDeep
};