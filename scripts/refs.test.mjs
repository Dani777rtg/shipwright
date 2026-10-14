// Every ECC tool that Shipwright's own skills, agents and references name must exist in the vendored catalog,
// so an ECC sync that drops or renames one fails CI instead of silently breaking a phase.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

const md = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? md(p) : n.endsWith('.md') ? [p] : [];
});

test('every vendor/ecc path named in skills, agents and reference exists and is available', () => {
  const { include } = JSON.parse(readFileSync(join(root, 'vendor', 'ecc.manifest.json'), 'utf8'));
  const ok = new Set(include.filter((i) => !i.pending).map((i) => i.path));
  const files = ['skills', 'agents', 'reference'].flatMap((d) => md(join(root, d)));
  let seen = 0;
  for (const f of files) {
    for (const [, p] of readFileSync(f, 'utf8').matchAll(/vendor\/ecc\/((?:agents|commands)\/[\w.-]+\.md|skills\/[\w-]+)/g)) {
      seen++;
      assert.ok(ok.has(p), `${f}: ${p} is not an available ECC item`);
      assert.ok(existsSync(join(root, 'vendor', 'ecc', p)), `${f}: ${p} missing on disk`);
    }
  }
  assert.ok(seen > 0);
});

test('skills and agents reference only Shipwright files that exist', () => {
  const files = ['skills', 'agents'].flatMap((d) => md(join(root, d)));
  for (const f of files) {
    for (const [, p] of readFileSync(f, 'utf8').matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/((?:reference|templates|docs|scripts|vendor\/superpowers)\/[\w./-]+?)(?=[`'")\s]|$)/g)) {
      assert.ok(existsSync(join(root, p)), `${f}: ${p} does not exist`);
    }
  }
});
