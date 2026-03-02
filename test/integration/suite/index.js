const path = require('node:path');
const fs = require('node:fs');
const Mocha = require('mocha');

function collectTestFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTestFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

function run() {
  const mocha = new Mocha({ ui: 'tdd', color: true, timeout: 10000 });
  const testsRoot = __dirname;

  for (const file of collectTestFiles(testsRoot)) {
    mocha.addFile(file);
  }

  return new Promise((resolve, reject) => {
    mocha.run((failures) => {
      if (failures > 0) {
        reject(new Error(`${failures} test(s) failed.`));
        return;
      }

      resolve();
    });
  });
}

module.exports = run;
