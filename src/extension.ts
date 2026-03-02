import * as vscode from 'vscode';
import { buildTargetCandidates, parseSmartJumpInput, toSafeLineIndex } from './core';

type SmartJumpPickItem = vscode.QuickPickItem & {
  uri: vscode.Uri;
  line: number;
};

const MAX_RESULTS = 10;

async function buildPickItems(input: string): Promise<{ items: SmartJumpPickItem[]; message?: string }> {
  const parsed = parseSmartJumpInput(input);
  if (!parsed) {
    return { items: [], message: '输入路径快速跳转' };
  }

  const exclude = '**/{node_modules,.git,dist,out,build}/**';
  const candidates = buildTargetCandidates(parsed.target);
  const items: SmartJumpPickItem[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const matchedFiles = await vscode.workspace.findFiles(candidate.pattern, exclude, MAX_RESULTS);
    for (const uri of matchedFiles) {
      const key = uri.toString();
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      items.push({
        label: vscode.workspace.asRelativePath(uri, false),
        description: `匹配: ${candidate.displayPath}`,
        detail: `跳转到第 ${parsed.line} 行`,
        alwaysShow: true,
        uri,
        line: parsed.line
      });

      if (items.length >= MAX_RESULTS) {
        break;
      }
    }

    if (items.length >= MAX_RESULTS) {
      break;
    }
  }

  if (items.length === 0) {
    const attempted = candidates.map((candidate) => candidate.displayPath).join(' / ');
    return {
      items: [],
      message: `未找到目标文件。已尝试: ${attempted}`
    };
  }

  return {
    items,
    message: `已找到 ${items.length} 个结果，回车打开`
  };
}

async function openPick(item: SmartJumpPickItem): Promise<void> {
  const document = await vscode.workspace.openTextDocument(item.uri);
  const editor = await vscode.window.showTextDocument(document, { preview: false });

  const safeLine = toSafeLineIndex(item.line, document.lineCount);
  const position = new vscode.Position(safeLine, 0);
  const selection = new vscode.Selection(position, position);
  editor.selection = selection;
  editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
}

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand('extension.smartJump', async () => {
    const quickPick = vscode.window.createQuickPick<SmartJumpPickItem>();
    quickPick.placeholder = '输入模块路径，例如 app.services.user_service.get_user_by_id:42';
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = true;

    let disposed = false;
    let requestId = 0;

    const updateItems = async (value: string) => {
      const currentRequestId = ++requestId;
      quickPick.busy = true;

      try {
        const { items, message } = await buildPickItems(value);
        if (disposed || currentRequestId !== requestId) {
          return;
        }

        quickPick.items = items;
        quickPick.activeItems = items.length > 0 ? [items[0]] : [];
        quickPick.title = message;
      } catch (error) {
        if (disposed || currentRequestId !== requestId) {
          return;
        }

        const message = error instanceof Error ? error.message : String(error);
        quickPick.title = `Smart Jump 执行失败: ${message}`;
        quickPick.items = [];
      } finally {
        if (!disposed && currentRequestId === requestId) {
          quickPick.busy = false;
        }
      }
    };

    quickPick.onDidChangeValue((value) => {
      void updateItems(value);
    });

    quickPick.onDidAccept(() => {
      const picked = quickPick.selectedItems[0] ?? quickPick.activeItems[0] ?? quickPick.items[0];
      if (!picked) {
        return;
      }

      void openPick(picked);
      quickPick.hide();
    });

    quickPick.onDidHide(() => {
      disposed = true;
      quickPick.dispose();
    });

    quickPick.show();
    void updateItems('');

  });

  context.subscriptions.push(disposable);
}

export function deactivate(): void {}
