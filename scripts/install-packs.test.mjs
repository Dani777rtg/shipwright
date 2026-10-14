import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { install, target, resolveStack } from './install-packs.mjs';
import { fileURLToPath } from 'node:url';

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

test('resolveStack: aliases, common always, unknown reported', () => {
  const map = { _note: 'x', typescript: ['rules/typescript'], ts: 'typescript', react: ['rules/react', 'rules/typescript'] };
  const r = resolveStack(['TS', 'react', 'cobol'], map);
  assert.deepEqual(r.paths, ['rules/common', 'rules/typescript', 'rules/react']);
  assert.deepEqual(r.unknown, ['cobol']);
  assert.ok(!r.known.includes('_note'));
});

test('every path in reference/stack-packs.json is an available ECC manifest item', () => {
  const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
  const map = JSON.parse(readFileSync(join(root, 'reference', 'stack-packs.json'), 'utf8'));
  const manifest = JSON.parse(readFileSync(join(root, 'vendor', 'ecc.manifest.json'), 'utf8'));
  const ok = new Set(manifest.include.filter((i) => !i.pending).map((i) => i.path));
  for (const [key, v] of Object.entries(map)) {
    if (key.startsWith('_')) continue;
    if (typeof v === 'string') { assert.ok(Array.isArray(map[v]), `${key} aliases unknown ${v}`); continue; }
    for (const p of v) {
      assert.ok(ok.has(p), `${key}: ${p} not in manifest`);
      assert.ok(target(p), `${key}: ${p} not installable`);
      assert.ok(existsSync(join(root, 'vendor', 'ecc', p)), `${key}: ${p} missing on disk`);
    }
  }
});

test('ECC process rules that Shipwright replaces are not installed', () => {
  const plugin = mkdtempSync(join(tmpdir(), 'sw-plugin-'));
  mkdirSync(join(plugin, 'vendor', 'ecc', 'rules', 'common'), { recursive: true });
  for (const f of ['coding-style.md', 'agents.md', 'development-workflow.md', 'git-workflow.md', 'code-review.md']) writeFileSync(join(plugin, 'vendor', 'ecc', 'rules', 'common', f), f);
  writeFileSync(join(plugin, 'vendor', 'ecc.manifest.json'), JSON.stringify({ include: [{ path: 'rules/common' }] }));
  const root = mkdtempSync(join(tmpdir(), 'sw-proj-'));
  install(root, ['rules/common'], plugin);
  const dest = join(root, '.claude', 'rules', 'ecc-common');
  assert.ok(existsSync(join(dest, 'coding-style.md')));
  for (const f of ['agents.md', 'development-workflow.md', 'git-workflow.md', 'code-review.md']) assert.ok(!existsSync(join(dest, f)), f);
});
