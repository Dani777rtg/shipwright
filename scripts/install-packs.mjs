#!/usr/bin/env node
// Installs the stack packs chosen in Architect from the vendored ECC catalog into the project:
//   rules/<x>        → .claude/rules/ecc-<x>/
//   skills/<x>       → .claude/skills/<x>/
//   agents/<x>.md    → .claude/agents/<x>.md
// Only paths listed in vendor/ecc.manifest.json "include" are accepted. Records them in .shipwright/state.json "packs".
// Usage (from the project root): node install-packs.mjs <manifest path>...   e.g. rules/python skills/fastapi-patterns
import { readFileSync, writeFileSync, existsSync, cpSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PLUGIN = join(dirname(fileURLToPath(import.meta.url)), '..');

export function target(path) {
  const [kind, ...rest] = path.split('/');
  const name = rest.join('/');
  if (kind === 'rules') return join('.claude', 'rules', `ecc-${name}`);
  if (kind === 'skills') return join('.claude', 'skills', name);
  if (kind === 'agents' && name.endsWith('.md')) return join('.claude', 'agents', basename(name));
  return null;
}

export function install(root, paths, pluginRoot = PLUGIN) {
  const manifest = JSON.parse(readFileSync(join(pluginRoot, 'vendor', 'ecc.manifest.json'), 'utf8'));
  const allowed = new Set(manifest.include.map((i) => i.path));
  const done = [];
  const errors = [];
  for (const p of paths) {
    const to = target(p);
    const from = join(pluginRoot, 'vendor', 'ecc', p);
    if (!allowed.has(p)) errors.push(`${p}: not in the ECC manifest`);
    else if (!to) errors.push(`${p}: only rules/, skills/ and agents/*.md can be installed`);
    else if (!existsSync(from)) errors.push(`${p}: not available in this ECC release`);
    else {
      mkdirSync(dirname(join(root, to)), { recursive: true });
      cpSync(from, join(root, to), { recursive: true });
      done.push(p);
    }
  }
  const statePath = join(root, '.shipwright', 'state.json');
  if (done.length && existsSync(statePath)) {
    const state = JSON.parse(readFileSync(statePath, 'utf8'));
    state.packs = [...new Set([...(state.packs ?? []), ...done])].sort();
    writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
  }
  return { done, errors };
}

function main(paths) {
  if (!paths.length) { console.error('usage: install-packs.mjs <manifest path>...'); return 2; }
  const { done, errors } = install(process.cwd(), paths);
  for (const d of done) console.log(`installed ${d} → ${target(d)}`);
  for (const e of errors) console.error(`error: ${e}`);
  return errors.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
