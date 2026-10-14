#!/usr/bin/env node
// Opens and closes an approved change (/shipwright:change). While open, the hook lets the listed files be edited
// even if they are approved or locked. Closing re-records the fingerprints of locked files.
// Run only after the user approved the change delta.
// Usage (from the project root):
//   node change.mjs open <id> <file>...
//   node change.mjs close
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { run as state } from './state.mjs';
import { record } from './lock.mjs';
import { log, docsDir } from './metrics.mjs';

export function open(root, id, files) {
  if (!id || !files.length) throw new Error('usage: change.mjs open <id> <file>...');
  if (state(root, ['get', 'change'])) throw new Error('a change is already open: close it first');
  const rel = files.map((f) => f.replace(/\\/g, '/').replace(/^\.\//, ''));
  if (rel.some((f) => f.startsWith('.shipwright/'))) throw new Error('.shipwright/ cannot be opened');
  state(root, ['set', 'change', JSON.stringify({ id, files: rel })]);
  log(join(docsDir(root), 'metrics.md'), 'change', 'start', `${id}: ${rel.length} file(s)`);
  return rel;
}

export function close(root) {
  const change = state(root, ['get', 'change']);
  if (!change) throw new Error('no open change');
  state(root, ['set', 'change', 'null']);
  const patterns = state(root, ['get', 'lockedPaths']) ?? [];
  if (patterns.length && existsSync(join(root, '.shipwright', 'locks.json'))) {
    writeFileSync(join(root, '.shipwright', 'locks.json'), JSON.stringify(record(root, patterns), null, 2) + '\n');
  }
  log(join(docsDir(root), 'metrics.md'), 'change', 'end', change.id);
  return change;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [cmd, id, ...files] = process.argv.slice(2);
  try {
    if (cmd === 'open') console.log(`Change ${id} open for: ${open(process.cwd(), id, files).join(', ')}`);
    else if (cmd === 'close') console.log(`Change ${close(process.cwd()).id} closed; locked files re-fingerprinted.`);
    else throw new Error('usage: change.mjs open <id> <file>... | close');
  } catch (e) { console.error(e.message); process.exit(2); }
}
