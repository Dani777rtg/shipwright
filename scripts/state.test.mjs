import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run } from './state.mjs';

test('init, get, set, add', () => {
  const root = mkdtempSync(join(tmpdir(), 'sw-'));
  assert.throws(() => run(root, ['get']), /mission/);
  run(root, ['init', '{"docsDir":"docs","phase":"mission"}']);
  assert.throws(() => run(root, ['init', '{}']), /exists/);
  assert.equal(run(root, ['get', 'phase']), 'mission');
  run(root, ['set', 'phase', 'intake']);
  run(root, ['set', 'qaProfile', '{"ui":true}']);
  run(root, ['add', 'lockedPaths', 'tests/acceptance/**']);
  run(root, ['add', 'lockedPaths', 'tests/acceptance/**']);
  assert.deepEqual(run(root, ['get']), { docsDir: 'docs', phase: 'intake', qaProfile: { ui: true }, lockedPaths: ['tests/acceptance/**'] });
  assert.throws(() => run(root, ['set', 'x']), /usage/);
});
