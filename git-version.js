/**
 * This script will set the current git  version information in ./src/assets/config.json.
 * Usage:
 * $ node ./git-version.js
 * $ ng build --prod
 */
const childProcess = require('child_process');
const { writeFileSync } = require('fs');
const config = require('./src/assets/config.json');

const longSHA = childProcess.execSync("git rev-parse HEAD").toString().trim();
const shortSHA = childProcess.execSync("git rev-parse --short HEAD").toString().trim();
const branch = childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
const authorName = childProcess.execSync("git log -1 --pretty=format:'%an'").toString().trim();
const commitTime = childProcess.execSync("git log -1 --pretty=format:'%cd'").toString().trim();
const commitMsg = childProcess.execSync("git log -1 --pretty=%B").toString().trim();
const totalCommitCount = childProcess.execSync("git rev-list --count HEAD").toString().trim();

config.ShortSHA = shortSHA;
config.SHA = longSHA;
config.Branch = branch;
config.LastCommitAuthor = authorName;
config.LastCommitTime = commitTime;
config.LastCommitMessage = commitMsg;
config.LastCommitNumber = totalCommitCount;

const configJson = JSON.stringify(config, null, 2);

writeFileSync('./src/assets/config.json', configJson);
