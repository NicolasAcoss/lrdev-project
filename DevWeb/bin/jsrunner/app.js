'use strict';

const {program} = require('./utils/commander.js');
const logger = require('./logger');
const Controller = require('./controller.js');

program
  //.version('0.0.1')
  // .option('-f, --file <filename>', 'Run a userScript based on a single file')
  // .option('-v, --vusers <vusers>', 'number of vusers to use', 1)
  // .option('-d, --userScriptDirectory <direcotry>', 'Run a userScript based on a userScriptDirectory')
  // .option('-c, --config <configurationFileName>', `Run a script based on a configuration file`)
  .option('-r, --remoteAddress <remoteHost>', 'sets the address of the remote Controller', 'localhost')
  .option('-p, --remotePort <remotePort>', 'sets the address of the remote Controller port', 6969)
  .option('-l, --logLevel <logLevel>', 'sets the log level for the JsRunner (default is info)')
  .option('-d, --debug <debug>', 'show the logs in the console (default is false)')
  .parse(process.argv);
const args = program.opts();

logger.setLoggerInfo({
  logLevel: args.logLevel,
  showInConsole: args.debug
});

const controller = new Controller({
  host: args.remoteAddress,
  port: args.remotePort
});

process.on('uncaughtException', (err) => {
  logger.error(err);
});

process.on('unhandledRejection', (reason) => {
  logger.error(reason);
});

controller.start();

process.on('uncaughtException', (err) => {
  logger.error('whoops! there was an error that wasn\'t caught: ', err);
});
