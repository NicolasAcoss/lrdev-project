
module.exports = {
  getGcSuitableFunction(gcInterval) {
    if (global.gc && gcInterval > 0) {
      const interval = gcInterval;
      return function(currentIteration) {
        if (currentIteration > 0 && currentIteration % interval === 0) {
          global.gc();
        }
      };
    }
    return function() {
    };
  }
};