import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { record, verify, importHoldout } from './lock.mjs';

test('record + verify detects changed, missing and new locked files; ignores CRLF', () => {
  const root = mkdtempSync(join(tmpdir(), 'sw-'));
  const L = ['tests/acceptance/**'];
  mkdirSync(join(root, 'tests', 'acceptance'), { recursive: true });
  mkdirSync(join(root, 'node_modules', 'tests', 'acceptance'), { recursive: true });
  writeFileSync(join(root, 'tests', 'acceptance', 'a.test.ts'), 'expect(1)\n');
  writeFileSync(join(root, 'tests', 'acceptance', 'b.test.ts'), 'expect(2)\n');
  writeFileSync(join(root, 'node_modules', 'tests', 'acceptance', 'x.js'), 'ignored');
  writeFileSync(join(root, 'src.ts'), 'code');
  const locks = record(root, L);
  assert.deepEqual(Object.keys(locks), ['tests/acceptance/a.test.ts', 'tests/acceptance/b.test.ts']);
  assert.deepEqual(verify(root, L, locks), []);

  writeFileSync(join(root, 'tests', 'acceptance', 'a.test.ts'), 'expect(1)\r\n');
  assert.deepEqual(verify(root, L, locks), []);

  writeFileSync(join(root, 'tests', 'acceptance', 'a.test.ts'), 'skip(1)\n');
  rmSync(join(root, 'tests', 'acceptance', 'b.test.ts'));
  writeFileSync(join(root, 'tests', 'acceptance', 'c.test.ts'), 'new');
  assert.deepEqual(verify(root, L, locks).sort(), [
    'changed: tests/acceptance/a.test.ts',
    'missing: tests/acceptance/b.test.ts',
    'new (not recorded by QA): tests/acceptance/c.test.ts',
  ]);
});

test('holdout import: copies into a locked path, fingerprints, never overwrites', () => {
  const root = mkdtempSync(join(tmpdir(), 'sw-'));
  const hold = mkdtempSync(join(tmpdir(), 'sw-hold-'));
  const L = ['tests/acceptance/**'];
  mkdirSync(join(hold, 'login'), { recursive: true });
  writeFileSync(join(hold, 'login', 'AC-02.1.test.ts'), 'expect(lockout)\n');
  assert.throws(() => importHoldout(root, L, hold, 'src/x', {}), /not inside a locked path/);
  assert.throws(() => importHoldout(root, L, join(hold, 'nope'), 'tests/acceptance/holdout', {}), /no holdout/);
  const locks = importHoldout(root, L, hold, 'tests/acceptance/holdout', { 'tests/acceptance/a.test.ts': 'h' });
  assert.deepEqual(Object.keys(locks).sort(), ['tests/acceptance/a.test.ts', 'tests/acceptance/holdout/login/AC-02.1.test.ts']);
  assert.throws(() => importHoldout(root, L, hold, 'tests/acceptance/holdout', locks), /overwrite/);
});
