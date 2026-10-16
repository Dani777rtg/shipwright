import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { save, inbox, done } from './feedback.mjs';

test('save, inbox, done', () => {
  process.env.SHIPWRIGHT_FEEDBACK_DIR = mkdtempSync(join(tmpdir(), 'sw-inbox-'));
  const root = join(mkdtempSync(join(tmpdir(), 'sw-')), 'Sistema Taller');
  mkdirSync(join(root, '.shipwright'), { recursive: true });
  writeFileSync(join(root, '.shipwright', 'state.json'), '{"phase":"build","mission":"taller"}');
  writeFileSync(join(root, 'r.md'), '# Feedback\nslow QA\n');
  assert.deepEqual(inbox(), []);
  const out = save(root, join(root, 'r.md'), new Date('2026-10-16T09:05:00Z'));
  assert.match(out, /sistema-taller-20261016-0905\.md$/);
  assert.match(readFileSync(out, 'utf8'), /phase: build · mission: taller[\s\S]*slow QA/);
  assert.deepEqual(inbox(), [out]);
  done(out);
  assert.deepEqual(inbox(), []);
});
