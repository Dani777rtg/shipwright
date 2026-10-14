#!/usr/bin/env node
// Installs the stack packs chosen in Architect from the vendored ECC catalog into the project:
//   rules/<x>        → .claude/rules/ecc-<x>/
//   skills/<x>       → .claude/skills/<x>/
//   agents/<x>.md    → .claude/agents/<x>.md
// Only paths listed in vendor/ecc.manifest.json "include" are accepted. Records them in .shipwright/state.json "packs".
// Usage (from the project root):
//   node install-packs.mjs --stack <keyword>... [--dry-run]   e.g. --stack typescript react postgresql web
//   node install-packs.mjs <manifest path>...                 extra packs beyond the stack map
// --stack resolves keywords through reference/stack-packs.json (always adding rules/common), so the same stack
// always installs the same packs.
import { readFileSync, writeFileSync, existsSync, cpSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PLUGIN = join(dirname(fileURLToPath(import.meta.url)), '..');

// ECC's always-on process rules: they tell every agent to search GitHub before coding, write PRD and architecture
// docs, spawn ecc:* agents and review after every change. Shipwright's phases replace them, and as always-on rules
// they would cost tokens on every turn of every agent.
export const SKIP_RULES = new Set(['agents.md', 'development-workflow.md', 'git-workflow.md', 'code-review.md'].map((f) => `rules/common/${f}`));

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
      cpSync(from, join(root, to), { recursive: true, filter: (src) => !SKIP_RULES.has(src.replace(/\\/g, '/').split('/vendor/ecc/')[1]) });
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

export function resolveStack(keys, map = JSON.parse(readFileSync(join(PLUGIN, 'reference', 'stack-packs.json'), 'utf8'))) {
  const paths = new Set(['rules/common']);
  const unknown = [];
  for (const raw of keys) {
    let entry = map[raw.toLowerCase()];
    if (typeof entry === 'string') entry = map[entry];
    if (Array.isArray(entry)) entry.forEach((p) => paths.add(p));
    else unknown.push(raw);
  }
  return { paths: [...paths], unknown, known: Object.keys(map).filter((k) => !k.startsWith('_')) };
}

function main(args) {
  let paths = args.filter((a) => a !== '--dry-run');
  if (paths[0] === '--stack') {
    const { paths: resolved, unknown, known } = resolveStack(paths.slice(1));
    if (unknown.length) { console.error(`unknown stack keyword(s): ${unknown.join(', ')}\nknown: ${known.join(', ')}`); return 1; }
    paths = resolved;
  }
  if (!paths.length) { console.error('usage: install-packs.mjs --stack <keyword>... [--dry-run] | <manifest path>...'); return 2; }
  if (args.includes('--dry-run')) { paths.forEach((p) => console.log(p)); return 0; }
  const { done, errors } = install(process.cwd(), paths);
  for (const d of done) console.log(`installed ${d} → ${target(d)}`);
  for (const e of errors) console.error(`error: ${e}`);
  return errors.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
