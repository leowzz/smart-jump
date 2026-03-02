const test = require('node:test');
const assert = require('node:assert/strict');

const {
  parseSmartJumpInput,
  buildSearchPattern,
  buildTargetCandidates,
  toSafeLineIndex
} = require('../../out/core.js');

test('parseSmartJumpInput parses module and default line', () => {
  assert.deepEqual(parseSmartJumpInput('a.b.c'), { target: 'a.b.c', line: 1 });
});

test('parseSmartJumpInput parses explicit line and symbol', () => {
  assert.deepEqual(parseSmartJumpInput('a.b.c:ClassName:120'), { target: 'a.b.c', line: 120 });
});

test('parseSmartJumpInput rejects empty input target', () => {
  assert.equal(parseSmartJumpInput(''), null);
});

test('buildSearchPattern supports dotted module and file extension input', () => {
  assert.equal(buildSearchPattern('pkg.module'), '**/pkg/module{,.*}');
  assert.equal(buildSearchPattern('pkg/module.py'), '**/pkg/module.py');
});

test('buildTargetCandidates returns symbol path and parent module path', () => {
  const candidates = buildTargetCandidates('python_notifier.notifier_manager._match_with_wildcard');
  assert.deepEqual(
    candidates.map((item) => item.displayPath),
    [
      'python_notifier/notifier_manager/_match_with_wildcard',
      'python_notifier/notifier_manager'
    ]
  );
});

test('toSafeLineIndex clamps to valid range', () => {
  assert.equal(toSafeLineIndex(1, 10), 0);
  assert.equal(toSafeLineIndex(99, 5), 4);
  assert.equal(toSafeLineIndex(0, 1), 0);
});
