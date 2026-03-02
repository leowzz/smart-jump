const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { runTests } = require('@vscode/test-electron');

function resolveVSCodeExecutablePath() {
  if (process.env.VSCODE_EXECUTABLE_PATH) {
    return process.env.VSCODE_EXECUTABLE_PATH;
  }

  const result = spawnSync('which', ['code'], { encoding: 'utf8' });
  const codePath = result.status === 0 ? result.stdout.trim() : '';
  if (codePath && fs.existsSync(codePath)) {
    return codePath;
  }

  return undefined;
}

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../..');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');
    const vscodeExecutablePath = resolveVSCodeExecutablePath();

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [path.resolve(__dirname, '../fixture-workspace')],
      ...(vscodeExecutablePath ? { vscodeExecutablePath } : {})
    });
  } catch (error) {
    console.error('Failed to run integration tests');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    process.exit(1);
  }
}

main();
