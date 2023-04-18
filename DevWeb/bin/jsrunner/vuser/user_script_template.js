const load = require('./vuser.js');
const message = require('./message.js');
const utils = require('./utils.js');
const scriptRunner = require('./engine/script_runner.js');
const userLifecycle = require('./user_lifecycle.js');
const constants = require('./../common/constants.js');
const gcUtil = require('./../common/gc_utils.js');
const {internalLog, LogLevel} = require('./utils/log_utils.js')(load);
const ErrorCodes = require('./error_codes.js');

let runGc;
module.exports = {
  runVuserStage(runParams) {
    let result = constants.status.success;
    const resultPromise = Promise.resolve()
      .then(() => {
        if (load.params === undefined) {
          load.params = load.initializeParams(load.config.user.userId);
        }
      })
      .then(() => {
        load.config.stage = runParams.stage;
        message.sendMessageSyncNoResponse('VUser.CycleStart', load.config.user.userId, {stage: runParams.stage});
        const flow = runParams.flow;

        switch (runParams.stage) {
          case 'initialize':
            return scriptRunner.initialize(flow)
              .catch((error) => {
                result = constants.status.failure;
                return Promise.reject(error);
              });
          case 'action':
            load.config.runtime.iteration += 1;
            return scriptRunner.action(flow)
              .catch((error) => {
                result = constants.status.failure;
                return Promise.reject(error);
              });
          case 'finalize':
            return scriptRunner.finalize(flow)
              .catch((error) => {
                result = constants.status.failure;
                return Promise.reject(error);
              });
        }
      });

    return resultPromise
      .catch((error) => {
        return userLifecycle.handleKnownError(load, error, runParams.stage);
      })
      .then(() => {
        userLifecycle.finishCycle(result, runParams.stage);
        runGc(load.config.runtime.iteration);
      })
      .catch((err) => {
        userLifecycle.crashVuser(load, err);
      });
  },

  loadTest(args) {
    return Promise.resolve().then(() => {
      load.config.user = args.user;
      load.config.host = args.host;
      load.config.env = args.env;
      load.config.runtime = {
        iteration: 0
      };
      load.config.script = args.script;

      global.load = load;
      runGc = gcUtil.getGcSuitableFunction(args.gcInterval);

      utils.initialize(load.config.logLevel, load.config.script.directory);

      require(args.script.fullPath);
      if (args.script.additionalFiles) {
        for (const fileTuple of args.script.additionalFiles) {
          require(fileTuple[0]);
        }
      }
    })
      .catch((err) => {
        internalLog(`Vuser "${err.message}" thrown at ${utils.getErrorPosition(err)}`, LogLevel.error, ErrorCodes.script);
        throw err;
      });
  }
};
