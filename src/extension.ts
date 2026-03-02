import * as vscode from 'vscode';
import { buildTargetCandidates, parseSmartJumpInput, toSafeLineIndex, type TargetCandidate } from './core';

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand('extension.smartJump', async () => {
    try {
      const input = await vscode.window.showInputBox({
        prompt: '输入模块路径，例如 a.b.c:ClassName:120',
        placeHolder: 'a.b.c[:Symbol][:Line]'
      });

      if (!input) {
        return;
      }

      const parsed = parseSmartJumpInput(input);
      if (!parsed) {
        vscode.window.showErrorMessage('输入格式不正确');
        return;
      }

      const exclude = '**/{node_modules,.git,dist,out,build}/**';
      const candidates = buildTargetCandidates(parsed.target);
      const candidateFiles = new Map<string, vscode.Uri[]>();
      let resolvedCandidate: TargetCandidate | undefined;
      let files: vscode.Uri[] = [];

      for (const candidate of candidates) {
        const matchedFiles = await vscode.workspace.findFiles(candidate.pattern, exclude, 50);
        candidateFiles.set(candidate.rawTarget, matchedFiles);
        if (!resolvedCandidate && matchedFiles.length > 0) {
          resolvedCandidate = candidate;
          files = matchedFiles;
        }
      }

      if (files.length === 0) {
        const attempted = candidates.map((candidate) => `- ${candidate.displayPath}`).join('\n');
        vscode.window.showWarningMessage(`未找到目标文件: ${parsed.target.replace(/\./g, '/')}\n已尝试:\n${attempted}`);
        return;
      }

      const fallbackCandidates = candidates.filter((candidate) => candidate.rawTarget !== parsed.target);
      const availableFallbacks = fallbackCandidates.filter((candidate) => (candidateFiles.get(candidate.rawTarget) ?? []).length > 0);

      if ((candidateFiles.get(parsed.target) ?? []).length === 0 && availableFallbacks.length > 0) {
        const pickItems = availableFallbacks.map((candidate) => ({
          label: candidate.displayPath,
          description: `${(candidateFiles.get(candidate.rawTarget) ?? []).length} 个匹配`,
          candidate
        }));

        const picked = await vscode.window.showQuickPick(pickItems, {
          placeHolder: '未找到精确目标，选择可用路径'
        });
        if (!picked) {
          return;
        }

        resolvedCandidate = picked.candidate;
        files = candidateFiles.get(picked.candidate.rawTarget) ?? [];
      }

      if (files.length > 1 && resolvedCandidate) {
        vscode.window.setStatusBarMessage(`Smart Jump 命中多个文件，已打开第一个: ${resolvedCandidate.displayPath}`, 3000);
      }

      const document = await vscode.workspace.openTextDocument(files[0]);
      const editor = await vscode.window.showTextDocument(document, { preview: false });

      const safeLine = toSafeLineIndex(parsed.line, document.lineCount);
      const position = new vscode.Position(safeLine, 0);
      const selection = new vscode.Selection(position, position);
      editor.selection = selection;
      editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Smart Jump 执行失败: ${message}`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate(): void {}
