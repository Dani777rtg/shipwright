import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { record, verify } from './lock.mjs';

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
