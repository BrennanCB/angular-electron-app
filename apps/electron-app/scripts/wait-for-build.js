const fs = require('fs');
const path = require('path');

const appPath = path.join('apps', 'electron-app', 'dist');

function waitForBuild(path) {
  console.log(`Waiting for ${path} to be created...`);

  if (!fs.existsSync(path)) setTimeout(() => waitForBuild(path), 2000);
}

waitForBuild(appPath);
