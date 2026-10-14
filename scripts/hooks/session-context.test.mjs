import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { context } from './session-context.mjs';

const hook = fileURLToPath(new URL('./session-context.mjs', import.meta.url));

test('no mission → no context; mission → phase, next command and open change', () => {
  const root = mkdtempSync(join(tmpdir(), 'sw-'));
  assert.equal(context(root), null);
  assert.equal(spawnSync(process.execPath, [hook], { input: JSON.stringify({ cwd: root }), encoding: 'utf8' }).stdout, '');

  mkdirSync(join(root, '.shipwright'));
  writeFileSync(join(root, '.shipwright', 'state.json'), JSON.stringify({
    mission: 'Resumir reuniones', phase: 'build', deadline: '2026-10-31', docsDir: 'docs', tasksDone: ['T001', 'T002'],
    change: { id: '003', files: ['docs/spec/requirements.md'] },
  }));
  const text = context(root);
  assert.match(text, /Resumir reuniones/);
  assert.match(text, /deadline: 2026-10-31 · .*next: \/shipwright:build/);
  assert.match(text, /Open change: 003/);
  assert.match(text, /Tasks done: 2/);

  const out = JSON.parse(spawnSync(process.execPath, [hook], { input: JSON.stringify({ cwd: root }), encoding: 'utf8' }).stdout);
  assert.equal(out.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.match(out.hookSpecificOutput.additionalContext, /Phase: build/);
});
