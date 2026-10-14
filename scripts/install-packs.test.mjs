import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { install, target } from './install-packs.mjs';

test('target maps vendor paths into .claude/', () => {
  assert.equal(target('rules/python').replace(/\\/g, '/'), '.claude/rules/ecc-python');
  assert.equal(target('skills/fastapi-patterns').replace(/\\/g, '/'), '.claude/skills/fastapi-patterns');
  assert.equal(target('agents/python-reviewer.md').replace(/\\/g, '/'), '.claude/agents/python-reviewer.md');
  assert.equal(target('workflows/x.js'), null);
});

test('install copies only manifest items and records them', () => {
  const plugin = mkdtempSync(join(tmpdir(), 'sw-plugin-'));
  mkdirSync(join(plugin, 'vendor', 'ecc', 'rules', 'python'), { recursive: true });
  mkdirSync(join(plugin, 'vendor', 'ecc', 'agents'), { recursive: true });
  writeFileSync(join(plugin, 'vendor', 'ecc', 'rules', 'python', 'testing.md'), 'pytest');
  writeFileSync(join(plugin, 'vendor', 'ecc', 'agents', 'python-reviewer.md'), '---\nname: python-reviewer\n---');
  writeFileSync(join(plugin, 'vendor', 'ecc.manifest.json'), JSON.stringify({ include: [
    { path: 'rules/python' }, { path: 'agents/python-reviewer.md' }, { path: 'skills/pending', pending: true },
  ] }));
  const root = mkdtempSync(join(tmpdir(), 'sw-proj-'));
  mkdirSync(join(root, '.shipwright'));
  writeFileSync(join(root, '.shipwright', 'state.json'), '{"docsDir":"docs"}');

  const { done, errors } = install(root, ['rules/python', 'agents/python-reviewer.md', 'skills/pending', 'skills/evil'], plugin);
  assert.deepEqual(done, ['rules/python', 'agents/python-reviewer.md']);
  assert.equal(errors.length, 2);
  assert.equal(readFileSync(join(root, '.claude', 'rules', 'ecc-python', 'testing.md'), 'utf8'), 'pytest');
  assert.ok(existsSync(join(root, '.claude', 'agents', 'python-reviewer.md')));
  assert.deepEqual(JSON.parse(readFileSync(join(root, '.shipwright', 'state.json'), 'utf8')).packs, ['agents/python-reviewer.md', 'rules/python']);
});
