import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { open, close } from './change.mjs';
import { run as state } from './state.mjs';

test('open/close a change: files listed, .shipwright refused, locks re-recorded', () => {
  const root = mkdtempSync(join(tmpdir(), 'sw-'));
  state(root, ['init', JSON.stringify({ docsDir: 'docs', lockedPaths: ['tests/acceptance/**'] })]);
  mkdirSync(join(root, 'tests', 'acceptance'), { recursive: true });
  writeFileSync(join(root, 'tests', 'acceptance', 'a.test.ts'), 'old');
  writeFileSync(join(root, '.shipwright', 'locks.json'), '{}');

  assert.throws(() => open(root, '001', ['.shipwright/state.json']), /cannot be opened/);
  assert.deepEqual(open(root, '001', ['.\\tests\\acceptance\\a.test.ts', 'docs/req.md']), ['tests/acceptance/a.test.ts', 'docs/req.md']);
  assert.throws(() => open(root, '002', ['x']), /already open/);

  writeFileSync(join(root, 'tests', 'acceptance', 'a.test.ts'), 'new');
  assert.equal(close(root).id, '001');
  assert.equal(state(root, ['get', 'change']), null);
  assert.ok(Object.keys(JSON.parse(readFileSync(join(root, '.shipwright', 'locks.json'), 'utf8'))).includes('tests/acceptance/a.test.ts'));
  assert.match(readFileSync(join(root, 'docs', 'metrics.md'), 'utf8'), /\| change \| end \| 001 \|/);
  assert.throws(() => close(root), /no open change/);
});
