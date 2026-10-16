import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { save, inbox, done, openIssue } from './feedback.mjs';

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

test('issue only into a private repo; any gh failure keeps it local', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sw-'));
  writeFileSync(join(dir, 'r.md'), '<!-- h -->\n# QA too slow\nbody');
  const calls = [];
  const fake = (priv) => (args) => { calls.push(args[0]); if (args[0] === 'repo') return priv; return 'https://github.com/x/y/issues/1'; };
  assert.equal(openIssue(join(dir, 'r.md'), fake('true')), 'https://github.com/x/y/issues/1');
  assert.ok(calls.includes('issue'));
  assert.equal(openIssue(join(dir, 'r.md'), fake('false')), null);
  assert.equal(openIssue(join(dir, 'r.md'), () => { throw new Error('gh not found'); }), null);
});
