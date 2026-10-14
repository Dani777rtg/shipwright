import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { phaseOf } from './metrics-start.mjs';

const hook = fileURLToPath(new URL('./metrics-start.mjs', import.meta.url));
const slash = (command_name, extra = {}) => ({ expansion_type: 'slash_command', command_name, ...extra });

test('phaseOf recognizes only Shipwright phase commands', () => {
  assert.equal(phaseOf(slash('shipwright:build')), 'build');
  assert.equal(phaseOf(slash('build', { command_source: 'plugin' })), 'build');
  assert.equal(phaseOf(slash('build', { command_source: 'user' })), null);
  assert.equal(phaseOf(slash('shipwright:spec')), null);
  assert.equal(phaseOf(slash('other:build')), null);
  assert.equal(phaseOf({ command_name: 'shipwright:build' }), null);
});

test('hook logs start only inside a mission and never fails', () => {
  const root = mkdtempSync(join(tmpdir(), 'sw-'));
  const run = (input) => spawnSync(process.execPath, [hook], { input: JSON.stringify(input), encoding: 'utf8' });
  assert.equal(run(slash('shipwright:build', { cwd: root })).status, 0);
  assert.equal(existsSync(join(root, 'docs', 'metrics.md')), false);
  mkdirSync(join(root, '.shipwright'));
  writeFileSync(join(root, '.shipwright', 'state.json'), JSON.stringify({ docsDir: 'docs/sw' }));
  assert.equal(run(slash('shipwright:build', { cwd: root })).status, 0);
  assert.match(readFileSync(join(root, 'docs', 'sw', 'metrics.md'), 'utf8'), /\| build \| start \|/);
  assert.equal(spawnSync(process.execPath, [hook], { input: '{' }).status, 0);
});
