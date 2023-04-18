'use strict';

class UserAbortError extends Error {
  constructor(exitType, message) {
    super(message);
    this.exitType = exitType;
    // Thrown UserAbortError - please make sure you\'ve added a call to send message to orchestrator beforehand that
    // announces the user abort sendsync  message.sendMessageSync('VUser.Abort', load.config.user.userId, {
    //           exitType: exitType,
    //           message: exitMessage
    //         });
  }
}

module.exports = UserAbortError;
