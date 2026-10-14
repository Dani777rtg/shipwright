#!/usr/bin/env node
// Mission metrics log (METODO.md §7). Appends events to <docsDir>/metrics.md and prints a per-phase summary.
// Usage:
//   node metrics.mjs log <phase> <event> [note]   event: start | gate-approved | gate-changes | gate-back | end | ecc
//   (ecc rows are written by the ecc-used hook: one per ECC tool read in a phase, note = its vendor path)
//   node metrics.mjs summary
// The docs directory comes from .shipwright/state.json ({"docsDir": "docs"}) in the project root (cwd).
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

export const PHASES = ['spec', 'build', 'verify', 'ship', 'retro', 'change'];
export const EVENTS = ['start', 'gate-approved', 'gate-changes', 'gate-back', 'end', 'ecc'];
const HEADER = '# Métricas de la misión\n\n<!-- Generado por Shipwright. No editar a mano. -->\n\n| Fecha (UTC) | Fase | Evento | Nota |\n|---|---|---|---|\n';

export function docsDir(root = process.cwd()) {
  const state = join(root, '.shipwright', 'state.json');
  const dir = existsSync(state) ? JSON.parse(readFileSync(state, 'utf8')).docsDir : 'docs';
  return join(root, dir ?? 'docs');
}

export function log(file, phase, event, note = '', now = new Date()) {
  if (!PHASES.includes(phase) || !EVENTS.includes(event)) throw new Error(`invalid phase/event: ${phase} ${event}`);
  if (!existsSync(file)) { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, HEADER); }
  appendFileSync(file, `| ${now.toISOString()} | ${phase} | ${event} | ${note.replace(/\|/g, '/').replace(/\r?\n/g, ' ')} |\n`);
}

export function summarize(text) {
  const rows = text.split(/\r?\n/)
    .map((l) => l.match(/^\| (\d{4}-[^|]+?) \| (\w+) \| ([\w-]+) \| ?(.*?) ?\|$/))
    .filter(Boolean)
    .map(([, t, phase, event, note]) => ({ t: Date.parse(t), phase, event, note }));
  const out = {};
  for (const r of rows) {
    const s = (out[r.phase] ??= { hours: 0, gateRounds: 0, open: null, ecc: [] });
    if (r.event === 'ecc') s.ecc.push(r.note);
    if (r.event === 'start' && s.open === null) s.open = r.t;
    if (r.event.startsWith('gate-')) s.gateRounds++;
    if ((r.event === 'end' || r.event === 'gate-approved') && s.open !== null) {
      s.hours += (r.t - s.open) / 3.6e6;
      s.open = null;
    }
  }
  for (const s of Object.values(out)) { s.hours = Math.round(s.hours * 100) / 100; delete s.open; }
  return out;
}

function main([cmd, phase, event, ...note]) {
  const file = join(docsDir(), 'metrics.md');
  if (cmd === 'log') { log(file, phase, event, note.join(' ')); return 0; }
  if (cmd === 'summary') {
    console.log(JSON.stringify(existsSync(file) ? summarize(readFileSync(file, 'utf8')) : {}, null, 2));
    return 0;
  }
  console.error('usage: metrics.mjs log <phase> <event> [note] | summary');
  return 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { process.exit(main(process.argv.slice(2))); } catch (e) { console.error(e.message); process.exit(2); }
}
