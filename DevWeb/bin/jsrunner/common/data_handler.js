'use strict';

class DataHandler {
  constructor(handler) {
    this.handler = handler;
    this.buffer = '';
  }

  getHandler() {
    return (data) => {
      this.buffer += data;
      let index = this.buffer.indexOf('\n');
      while (index >= 0) {
        const msg = this.buffer.substr(0, index);
        this.buffer = this.buffer.substr(index + 1);
        index = this.buffer.indexOf('\n');
        if (msg) {
          this.handler(msg);
        }
      }
    };
  }
}

module.exports = DataHandler;