#!/usr/bin/env node
// Fingerprints of locked files (acceptance tests written by the QA agent). The PreToolUse hook blocks edits;
// this catches anything that slipped past it (scripts, generated files, other tools).
// Usage (from the project root):
//   node lock.mjs record   — hash every file matching state.lockedPaths into .shipwright/locks.json
//   node lock.mjs verify   — exit 1 listing changed, missing or new files under the locked paths
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { lockedBy } from './hooks/protect-approved.mjs';

const SKIP = new Set(['.git', 'node_modules', '.shipwright', 'graphify-out', '.venv', 'venv', '__pycache__', 'dist', 'build']);

export function lockedFiles(root, patterns) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (SKIP.has(name)) continue;
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else {
        const rel = relative(root, p).replace(/\\/g, '/');
        if (lockedBy(rel, patterns)) out.push(rel);
      }
    }
  };
  walk(root);
  return out.sort();
}

// Line endings are normalized so a checkout on another OS does not look like tampering.
const hash = (file) => createHash('sha256').update(readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');

export function record(root, patterns) {
  return Object.fromEntries(lockedFiles(root, patterns).map((f) => [f, hash(join(root, f))]));
}

export function verify(root, patterns, recorded) {
  const now = record(root, patterns);
  const problems = [];
  for (const [f, h] of Object.entries(recorded)) {
    if (!(f in now)) problems.push(`missing: ${f}`);
    else if (now[f] !== h) problems.push(`changed: ${f}`);
  }
  for (const f of Object.keys(now)) if (!(f in recorded)) problems.push(`new (not recorded by QA): ${f}`);
  return problems;
}

function main([cmd, arg]) {
  const root = process.cwd();
  const statePath = join(root, '.shipwright', 'state.json');
  const locksPath = join(root, '.shipwright', 'locks.json');
  const patterns = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')).lockedPaths ?? [] : [];
  if (!patterns.length) { console.error('No lockedPaths in .shipwright/state.json'); return 2; }
  if (cmd === 'record') {
    const locks = record(root, patterns);
    writeFileSync(locksPath, JSON.stringify(locks, null, 2) + '\n');
    console.log(`Recorded ${Object.keys(locks).length} locked file(s).`);
    return 0;
  }
  if (cmd === 'verify') {
    if (!existsSync(locksPath)) { console.error('No .shipwright/locks.json: run "lock.mjs record" first.'); return 2; }
    const problems = verify(root, patterns, JSON.parse(readFileSync(locksPath, 'utf8')));
    if (!problems.length) { console.log('Locked files intact.'); return 0; }
    console.log(`Locked files tampered (${problems.length}):`);
    for (const p of problems) console.log(`  - ${p}`);
    return 1;
  }
  console.error('usage: lock.mjs record|verify');
  return 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
