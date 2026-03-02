export interface ParsedInput {
  target: string;
  line: number;
}

export interface TargetCandidate {
  rawTarget: string;
  displayPath: string;
  pattern: string;
}

export function parseSmartJumpInput(input: string): ParsedInput | null {
  const value = input.trim();
  if (!value) {
    return null;
  }

  const segments = value.split(':');
  const target = (segments[0] ?? '').trim();
  if (!target) {
    return null;
  }

  const tail = (segments[segments.length - 1] ?? '').trim();
  const lineStr = /^\d+$/.test(tail) ? tail : undefined;
  const line = Math.max(1, Number.parseInt(lineStr ?? '1', 10) || 1);
  return { target, line };
}

export function buildSearchPattern(target: string): string {
  const relativePath = target.includes('/') ? target : target.replace(/\./g, '/');
  const hasExtension = /\/?[^/]+\.[^/]+$/.test(relativePath);
  return hasExtension ? `**/${relativePath}` : `**/${relativePath}{,.*}`;
}

export function buildTargetCandidates(target: string): TargetCandidate[] {
  const normalized = target.trim();
  if (!normalized) {
    return [];
  }

  const parent = normalized.includes('.') ? normalized.slice(0, normalized.lastIndexOf('.')) : '';
  const rawTargets = [...new Set([normalized, parent].filter(Boolean))];

  return rawTargets.map((rawTarget) => {
    const displayPath = rawTarget.includes('/') ? rawTarget : rawTarget.replace(/\./g, '/');
    return {
      rawTarget,
      displayPath,
      pattern: buildSearchPattern(rawTarget)
    };
  });
}

export function toSafeLineIndex(requestedLine: number, lineCount: number): number {
  const lineIndex = Math.max(0, requestedLine - 1);
  return Math.min(lineIndex, Math.max(lineCount - 1, 0));
}
