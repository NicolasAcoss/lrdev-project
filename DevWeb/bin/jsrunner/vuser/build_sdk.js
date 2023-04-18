'use strict';
const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'sdk');
const fileNames = fs.readdirSync(directory);
const targetFileName = 'vuser.js';

let content = `'use strict';
const submodules = [];
const sdk = {};
`;

fileNames.forEach(filename => {
  content = `${content}submodules.push(require('./sdk/${filename}')(sdk)); \n`;
});
content = `
${content}
Object.assign(sdk, ...submodules);
module.exports = Object.seal(sdk);
`;
content = `${content}`;

fs.writeFileSync(path.join(__dirname, targetFileName), content);