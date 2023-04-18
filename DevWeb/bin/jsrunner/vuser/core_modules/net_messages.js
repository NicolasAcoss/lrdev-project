const netMessages = {
  error: {
    registerSocketArgument: 'Bad argument passed to registerBareSocket: Please pass socketId (string) & callback onmessage func (string)',
    unRegisterBareSocketArgument: 'Bad argument passed to unRegisterBareSocket: Please pass socketId (string)',
    sendArgument: 'Bad argument passed to send: Please pass messageId (int), Payload (string) and the callback (function)',
    sendSyncArgument: 'Bad argument passed to sendSync: Please pass MsgID (int) & Payload (string)',
    sendSyncEmptyPayload: 'Empty payload passed to sendSync',
    sendSyncNoWaitArgument: 'Bad argument passed to sendSyncNoWait: Please pass messageId (int) & Payload (string)',
    sendSyncNoWaitEmptyPayload: 'Empty payload passed to sendSyncNoWait',
    newSocketBarrierArgument: 'Bad argument passed to newSocketBarrier: Please pass socketId (string) & timeout (Integer)',
    breakSocketBarrierArgument: 'Bad argument passed to breakBareSocketBarrier: Please pass socketId (string)'
  }
};

module.exports = netMessages;