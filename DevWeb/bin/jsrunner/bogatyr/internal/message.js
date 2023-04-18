'use strict';
module.exports = {
  createMessage(uid, messageType, status, content) {
    return {
      uid,
      messageType,
      status,
      content
    };
  }
};
