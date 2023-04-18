'use strict';

class StackedError extends Error {
  constructor(message, originalError) {
    super(message);
    this.originalError = originalError;
  }
}

module.exports = StackedError;
