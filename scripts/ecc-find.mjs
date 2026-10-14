#!/usr/bin/env node
// Finds ECC tools across the whole vendored catalog, not only under one phase heading of the index.
// Usage: node ecc-find.mjs <word>... [--phase <phase>]
// Every word must appear in the path or summary (case-insensitive). Items tagged with --phase come first.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PLUGIN = join(dirname(fileURLToPath(import.meta.url)), '..');

export function find(items, words, phase = null) {
  const ws = words.map((w) => w.toLowerCase());
  return items
    .filter((i) => !i.pending && ws.every((w) => `${i.path} ${i.summary ?? ''}`.toLowerCase().includes(w)))
    .sort((a, b) => Number((b.phases ?? []).includes(phase)) - Number((a.phases ?? []).includes(phase)) || a.path.localeCompare(b.path));
}

function main(args) {
  const pi = args.indexOf('--phase');
  const phase = pi >= 0 ? args.splice(pi, 2)[1] : null;
  if (!args.length) { console.error('usage: ecc-find.mjs <word>... [--phase <phase>]'); return 2; }
  const { include } = JSON.parse(readFileSync(join(PLUGIN, 'vendor', 'ecc.manifest.json'), 'utf8'));
  const hits = find(include, args, phase);
  for (const i of hits) console.log(`${i.path} | ${i.kind} | ${(i.phases ?? []).join(',')} | ${i.summary ?? ''}`);
  if (!hits.length) console.log('no matches — try fewer or broader words');
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
