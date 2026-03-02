const assert = require('node:assert/strict');
const vscode = require('vscode');

suite('Smart Jump Extension Integration', () => {
  test('registers extension.smartJump command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('extension.smartJump'));
  });
});
