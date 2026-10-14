#!/usr/bin/env node
// The only writer of .shipwright/state.json (the hook blocks direct edits to .shipwright/).
// Usage (from the project root):
//   node state.mjs init '<json>'          create the state (fails if it exists)
//   node state.mjs get [key]              print the state or one key
//   node state.mjs set <key> <value>      value is JSON if it parses, else a string
//   node state.mjs add <key> <value>      append to an array key (no duplicates)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const statePath = (root) => join(root, '.shipwright', 'state.json');
export const read = (root) => JSON.parse(readFileSync(statePath(root), 'utf8'));
const write = (root, s) => writeFileSync(statePath(root), JSON.stringify(s, null, 2) + '\n');
const parse = (v) => { try { return JSON.parse(v); } catch { return v; } };

export function run(root, [cmd, key, value]) {
  if (cmd === 'init') {
    if (existsSync(statePath(root))) throw new Error('state already exists');
    const s = parse(key);
    if (typeof s !== 'object' || Array.isArray(s) || s === null) throw new Error('init needs a JSON object');
    mkdirSync(join(root, '.shipwright'), { recursive: true });
    write(root, s);
    return s;
  }
  if (!existsSync(statePath(root))) throw new Error('no .shipwright/state.json: run /shipwright:mission first');
  const s = read(root);
  if (cmd === 'get') return key ? s[key] : s;
  if (!key || value === undefined) throw new Error(`usage: ${cmd} <key> <value>`);
  if (cmd === 'set') s[key] = parse(value);
  else if (cmd === 'add') s[key] = [...new Set([...(s[key] ?? []), parse(value)])];
  else throw new Error(`unknown command ${cmd}`);
  write(root, s);
  return s[key];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const out = run(process.cwd(), process.argv.slice(2));
    if (out !== undefined) console.log(typeof out === 'string' ? out : JSON.stringify(out, null, 2));
  } catch (e) { console.error(e.message); process.exit(2); }
}
