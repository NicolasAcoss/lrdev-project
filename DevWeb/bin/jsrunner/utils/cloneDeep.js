function cloneDeep(obj, hash = new WeakMap()) {
  let newVal;
  if (Object(obj) !== obj || obj instanceof Function) {
    return obj;
  }
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  if (obj instanceof Array) {
    newVal = [];
    obj.forEach(item => {
      newVal.push(cloneDeep(item, hash));
    });
  } else if (obj instanceof Buffer) {
    newVal = Buffer.from(obj);
  } else if (obj instanceof Date) {
    newVal = new Date(obj);
  } else if (obj instanceof Map) {
    newVal = new Map();
    obj.forEach((value, key) => {
      newVal.set(key, cloneDeep(value, hash));
    });
  } else if (obj instanceof Set) {
    newVal = new Set();
    obj.forEach((item) => {
      newVal.add(cloneDeep(item, hash));
    });
  } else if (obj instanceof Error) {
    newVal = new Error(obj);
    newVal.stack = obj.stack;
  } else if (obj instanceof RegExp) {
    newVal = new RegExp(obj);
  } else {
    newVal = {};
    if (obj.constructor) {
      // clone object prototype
      newVal = Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
    }
    hash.set(obj, newVal);
    for (const attr in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, attr)) {
        newVal[attr] = cloneDeep(obj[attr], hash);
      }
    }
  }
  return newVal;
}

module.exports = cloneDeep;