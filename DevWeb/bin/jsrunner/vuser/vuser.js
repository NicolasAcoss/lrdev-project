
'use strict';
const submodules = [];
const sdk = {};
submodules.push(require('./sdk/authentication.js')(sdk)); 
submodules.push(require('./sdk/azure.js')(sdk)); 
submodules.push(require('./sdk/certificate.js')(sdk)); 
submodules.push(require('./sdk/cookies.js')(sdk)); 
submodules.push(require('./sdk/extractors.js')(sdk)); 
submodules.push(require('./sdk/file.js')(sdk)); 
submodules.push(require('./sdk/flow_control.js')(sdk)); 
submodules.push(require('./sdk/general.js')(sdk)); 
submodules.push(require('./sdk/grpc.js')(sdk)); 
submodules.push(require('./sdk/net.js')(sdk)); 
submodules.push(require('./sdk/parameters.js')(sdk)); 
submodules.push(require('./sdk/rendezvous.js')(sdk)); 
submodules.push(require('./sdk/timers.js')(sdk)); 
submodules.push(require('./sdk/transaction.js')(sdk)); 
submodules.push(require('./sdk/utils.js')(sdk)); 
submodules.push(require('./sdk/vts.js')(sdk)); 
submodules.push(require('./sdk/web_request.js')(sdk)); 
submodules.push(require('./sdk/web_socket.js')(sdk)); 

Object.assign(sdk, ...submodules);
module.exports = Object.seal(sdk);
