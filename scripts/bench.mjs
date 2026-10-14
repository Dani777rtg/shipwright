#!/usr/bin/env node
// Scores a finished Shipwright mission so framework versions can be compared (METODO.md §9).
// Usage:
//   node bench.mjs score <projectDir> [--out <file.json>]
//   node bench.mjs compare <before.json> <after.json>
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { collectFiles, parse, check, collectTestIds, overBudget } from './trace.mjs';
import { summarize } from './metrics.mjs';
import { verify } from './lock.mjs';

// Artifacts each mission size must produce (METODO.md §2). More than required is not better.
const S_ARTIFACTS = ['mission.md', 'spec/requirements.md', 'plan/tasks.md', 'qa/report.md'];
const M_ARTIFACTS = [...S_ARTIFACTS, 'architecture/ARCHITECTURE.md', 'security/threat-model.md', 'qa/test-strategy.md', 'security/report.md'];
export const ARTIFACTS = { S: S_ARTIFACTS, M: M_ARTIFACTS, L: [...M_ARTIFACTS, 'ops/deploy-plan.md', 'handover.md'] };

export function score(root) {
  const state = JSON.parse(readFileSync(join(root, '.shipwright', 'state.json'), 'utf8'));
  const docs = join(root, state.docsDir ?? 'docs');
  const size = state.size ?? 'L';
  const required = ARTIFACTS[size];
  const present = required.filter((a) => existsSync(join(docs, a)));
  const parsed = parse(collectFiles(docs).map((p) => ({ path: p, text: readFileSync(p, 'utf8') })));
  const kinds = {};
  for (const it of parsed.items.values()) kinds[it.kind] = (kinds[it.kind] ?? 0) + 1;
  const tests = collectTestIds([join(root, 'tests')]);
  const traceProblems = check(parsed, 'qa', tests, size).length;
  const locks = join(root, '.shipwright', 'locks.json');
  const tampered = existsSync(locks) && state.lockedPaths?.length
    ? verify(root, state.lockedPaths, JSON.parse(readFileSync(locks, 'utf8'))).length : null;
  const report = existsSync(join(docs, 'qa', 'report.md')) ? readFileSync(join(docs, 'qa', 'report.md'), 'utf8') : '';
  const metrics = existsSync(join(docs, 'metrics.md')) ? summarize(readFileSync(join(docs, 'metrics.md'), 'utf8')) : {};
  const hours = Object.values(metrics).reduce((h, p) => h + p.hours, 0);
  const gateRounds = Object.values(metrics).reduce((n, p) => n + p.gateRounds, 0);
  return {
    size,
    artifacts: `${present.length}/${required.length}`,
    missing: required.filter((a) => !present.includes(a)),
    overBudget: overBudget(parsed.items, parsed.texts, size).length,
    ids: kinds,
    traceProblems,
    lockedTampered: tampered,
    verdict: /\bNO SHIP\b/.test(report) ? 'NO SHIP' : /\bSHIP\b/.test(report) ? 'SHIP' : 'none',
    hours: Math.round(hours * 100) / 100,
    gateRounds,
    perPhase: metrics,
  };
}

// Better = fewer hours, gate rounds, trace problems and budget overruns; every required artifact; SHIP verdict.
// A bigger mission (more items than its size allows) is worse, never better.
export function compare(a, b) {
  const missing = (s) => { const [have, need] = String(s).split('/').map(Number); return need - have; };
  const fewer = (k) => [a[k] ?? 0, b[k] ?? 0, (b[k] ?? 0) <= (a[k] ?? 0) ? 'better-or-equal' : 'worse'];
  return {
    size: [a.size, b.size, a.size === b.size ? 'better-or-equal' : 'worse'],
    hours: fewer('hours'),
    gateRounds: fewer('gateRounds'),
    traceProblems: fewer('traceProblems'),
    overBudget: fewer('overBudget'),
    artifacts: [a.artifacts, b.artifacts, missing(b.artifacts) <= missing(a.artifacts) ? 'better-or-equal' : 'worse'],
    verdict: [a.verdict, b.verdict, b.verdict === 'SHIP' || a.verdict !== 'SHIP' ? 'better-or-equal' : 'worse'],
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [cmd, a, b, c] = process.argv.slice(2);
  try {
    if (cmd === 'score' && a) {
      const out = JSON.stringify(score(a), null, 2);
      if (b === '--out' && c) writeFileSync(c, out + '\n');
      console.log(out);
    } else if (cmd === 'compare' && a && b) {
      const r = compare(JSON.parse(readFileSync(a, 'utf8')), JSON.parse(readFileSync(b, 'utf8')));
      console.log(JSON.stringify(r, null, 2));
      process.exit(Object.values(r).some(([, , v]) => v === 'worse') ? 1 : 0);
    } else throw new Error('usage: bench.mjs score <projectDir> [--out f.json] | compare <before.json> <after.json>');
  } catch (e) { console.error(e.message); process.exit(2); }
}
