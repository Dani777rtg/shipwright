import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eccPath } from './ecc-used.mjs';

const hook = fileURLToPath(new URL('./ecc-used.mjs', import.meta.url));

test('eccPath recognizes ECC agents, commands and skill entry files only', () => {
  assert.equal(eccPath('C:\\p\\shipwright\\vendor\\ecc\\agents\\planner.md'), 'agents/planner.md');
  assert.equal(eccPath('/p/vendor/ecc/commands/plan-prd.md'), 'commands/plan-prd.md');
  assert.equal(eccPath('/p/vendor/ecc/skills/blueprint/SKILL.md'), 'skills/blueprint');
  assert.equal(eccPath('/p/vendor/ecc/skills/blueprint/notes.md'), null);
  assert.equal(eccPath('/p/vendor/ecc.index.md'), null);
  assert.equal(eccPath('/p/src/agents/planner.md'), null);
});

test('hook logs once per phase inside a mission and never fails', () => {
  const root = mkdtempSync(join(tmpdir(), 'sw-'));
  const read = (file_path) => spawnSync(process.execPath, [hook], {
    input: JSON.stringify({ tool_name: 'Read', tool_input: { file_path }, cwd: root }), encoding: 'utf8',
  });
  const agent = '/plugin/vendor/ecc/agents/planner.md';
  assert.equal(read(agent).status, 0);
  assert.equal(existsSync(join(root, 'docs', 'metrics.md')), false);
  mkdirSync(join(root, '.shipwright'));
  writeFileSync(join(root, '.shipwright', 'state.json'), JSON.stringify({ docsDir: 'docs/sw', phase: 'plan' }));
  read(agent);
  read(agent);
  const rows = readFileSync(join(root, 'docs', 'sw', 'metrics.md'), 'utf8').match(/\| plan \| ecc \| agents\/planner\.md \|/g);
  assert.equal(rows.length, 1);
  assert.equal(spawnSync(process.execPath, [hook], { input: '{' }).status, 0);
});
