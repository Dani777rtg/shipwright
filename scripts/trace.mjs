#!/usr/bin/env node
// shipwright trace — deterministic objective-traceability check (METODO.md §3).
// Usage: node trace.mjs [docsDir=docs] [--phase intake|architect|plan|qa] [--size S|M|L] [--tests <dir>]...
// Exit 0 = ok, 1 = violations (printed), 2 = usage error.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const ID = String.raw`(?:O-\d+|KR-\d+|QG-\d+|QS-\d+|TM-\d+|ADR-\d+|C-\d+|US-\d+|AC-\d+\.\d+|T\d{3,})`;
const DEF_RE = new RegExp(String.raw`^\s*(?:#{1,6}\s+|[-*]\s+)(?:\*\*)?(${ID})\b`);
const SERVES_RE = /serves:\s*([^\n]*)/i;
const RISK_RE = /^\s*riesgo:\s*(alto|bajo)\s+(?:—|--)\s+\S.{9,}/im; // METODO.md §3: decides how much rigor a story gets
const NOT_APPLICABLE_RE =/no aplica:|not applicable:|riesgo aceptado:|accepted risk:/i;

const kindOf = (id) => id.match(/^[A-Z]+/)[0];

// Which kinds each kind may serve. M is the root; O serves the mission implicitly; TM (threats) are roots too.
const ALLOWED = {
  KR: ['O'], QG: ['O', 'KR'], US: ['O'], AC: ['O', 'US'],
  QS: ['QG'], ADR: ['QS', 'TM'], C: ['ADR', 'US', 'QS', 'TM'], T: ['AC', 'QS', 'TM'],
};

// Downward coverage required at each phase gate: [parent, child kinds that must serve it].
const COVERAGE = {
  intake: [['O', ['KR']], ['O', ['AC']]],
  architect: [['QG', ['QS']], ['QS', ['ADR', 'C']]],
  plan: [['AC', ['T']], ['QS', ['T']], ['TM', ['T']]],
  qa: [],
};
const PHASES = Object.keys(COVERAGE);

// Mission size (METODO.md §2): S skips Architect, so it has no QS coverage and may not hold high-risk stories.
// Budgets cap how many items of each kind a mission may produce; exceeding one needs a written waiver line
// "Presupuesto excedido: <KIND> — <reason>" in any mission document.
export const BUDGETS = {
  S: { US: 3, AC: 12, T: 10, ADR: 1, TM: 0, QS: 0 },
  M: { US: 10, AC: 50, T: 40, ADR: 6, TM: 15, QS: 8 },
  L: {},
};
const WAIVER_RE = /presupuesto excedido:\s*([A-Z]+)\s+(?:—|--)\s+\S.{9,}/gi;

export function collectFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== 'client') out.push(...collectFiles(p)); // client material is raw input, not ours
    } else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

export function parse(files) {
  const items = new Map();
  const errors = [];
  for (const { path, text } of files) {
    let current = null;
    text.split(/\r?\n/).forEach((line, i) => {
      const m = line.match(DEF_RE);
      if (m) {
        const id = m[1];
        if (items.has(id)) {
          const prev = items.get(id);
          errors.push(`${path}:${i + 1} ${id} defined twice (first at ${prev.path}:${prev.line})`);
        }
        current = { id, kind: kindOf(id), path, line: i + 1, body: [line] };
        items.set(id, current);
      } else if (current) current.body.push(line);
    });
  }
  for (const it of items.values()) {
    const text = it.body.join('\n');
    it.na = NOT_APPLICABLE_RE.test(text);
    const s = text.match(SERVES_RE);
    if (!s) { it.serves = null; continue; }
    const [refs, ...reason] = s[1].split(/\s+(?:—|--)\s+/);
    it.serves = refs.split(/[,\s]+/).map((r) => r.replace(/[[\]`*]/g, '')).filter(Boolean);
    it.reason = reason.join(' ').trim();
  }
  return { items, errors, texts: files.map((f) => f.text) };
}

// IDs cited anywhere in test files (names, docstrings, comments): the evidence that a criterion is tested.
export function collectTestIds(dirs) {
  const ids = new Set();
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      if (['node_modules', '.git', '__pycache__'].includes(name)) continue;
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else for (const m of readFileSync(p, 'utf8').matchAll(/(?<![A-Za-z0-9])(AC[-_]\d+[._]\d+|QS[-_]\d+|TM[-_]\d+)(?![0-9])/g)) ids.add(m[1].replace('_', '-').replace(/(AC-\d+)_/, '$1.'));
    }
  };
  for (const d of dirs.filter(existsSync)) walk(d);
  return ids;
}

// QS and TM evidence may also be a QA report line such as "QS-2 … evidencia: k6 p95 = 180 ms".
const evidenced = (texts) => new Set(texts.flatMap((t) => t.split(/\r?\n/))
  .flatMap((l) => /evidencia:|evidence:/i.test(l) ? [...l.matchAll(/(?<![A-Za-z0-9])(?:QS|TM)-\d+(?![0-9])/g)].map((m) => m[0]) : []));

export function overBudget(items, texts, size) {
  const limits = BUDGETS[size] ?? {};
  const waived = new Set(texts.flatMap((t) => [...t.matchAll(WAIVER_RE)].map((m) => m[1].toUpperCase())));
  const count = {};
  for (const it of items.values()) count[it.kind] = (count[it.kind] ?? 0) + 1;
  return Object.entries(limits)
    .filter(([kind, max]) => (count[kind] ?? 0) > max && !waived.has(kind))
    .map(([kind, max]) => `over budget for size ${size}: ${count[kind]} ${kind} (max ${max}) — reduce it, raise the size, or add "Presupuesto excedido: ${kind} — <why>"`);
}

export function check({ items, errors, texts = [] }, phase = 'intake', testIds = null, size = null) {
  const out = [...errors];
  const where = (it) => `${it.path}:${it.line} ${it.id}`;
  for (const it of items.values()) {
    const allowed = ALLOWED[it.kind];
    if (!allowed) continue;
    if (phase === 'intake' && it.kind === 'US' && !RISK_RE.test(it.body.join('\n'))) out.push(`${where(it)} missing "riesgo: alto|bajo — <why>" (METODO.md §3)`);
    if (size === 'S' && it.kind === 'US' && /^\s*riesgo:\s*alto/im.test(it.body.join('\n'))) out.push(`${where(it)} is riesgo alto: size S cannot hold high-risk stories — raise the mission to M`);
    if (!it.serves) { out.push(`${where(it)} orphan: missing "serves: <ID> — <how>"`); continue; }
    if (it.reason.length < 10) out.push(`${where(it)} serves needs a reason: "serves: <ID> — <how it serves it>"`);
    for (const ref of it.serves) {
      if (!items.has(ref)) out.push(`${where(it)} serves unknown ID ${ref}`);
      else if (!allowed.includes(kindOf(ref))) out.push(`${where(it)} cannot serve ${ref} (${it.kind} may serve: ${allowed.join(', ')})`);
    }
  }
  // Coverage is transitive: AC → US → O covers O.
  const children = new Map();
  for (const it of items.values()) {
    const seen = new Set();
    const stack = [...(it.serves ?? [])];
    while (stack.length) {
      const ref = stack.pop();
      if (seen.has(ref)) continue;
      seen.add(ref);
      if (!children.has(ref)) children.set(ref, new Set());
      children.get(ref).add(it.kind);
      stack.push(...(items.get(ref)?.serves ?? []));
    }
  }
  for (const p of PHASES.slice(0, PHASES.indexOf(phase) + 1)) {
    if (size === 'S' && p === 'architect') continue;
    for (const [parent, kinds] of COVERAGE[p]) {
      for (const it of items.values()) {
        if (it.kind !== parent || it.na) continue;
        const have = children.get(it.id) ?? new Set();
        if (!kinds.some((k) => have.has(k))) out.push(`${where(it)} not covered: needs at least one ${kinds.join(' or ')} serving it`);
      }
    }
  }
  if (phase === 'qa') {
    const tested = testIds ?? new Set();
    const withEvidence = evidenced(texts);
    for (const it of items.values()) {
      if (it.na) continue;
      if (it.kind === 'AC' && !tested.has(it.id)) out.push(`${where(it)} untested: no test cites ${it.id}`);
      if ((it.kind === 'QS' || it.kind === 'TM') && !tested.has(it.id) && !withEvidence.has(it.id)) out.push(`${where(it)} no evidence: cite ${it.id} in a test or in a QA report line with "evidencia:"`);
    }
  }
  if (size) out.push(...overBudget(items, texts, size));
  if (![...items.values()].some((it) => it.kind === 'O')) out.push('no objectives (O-n) defined');
  if (![...items.values()].some((it) => it.kind === 'QG')) out.push('no quality goals (QG-n) defined');
  return out;
}

function main(argv) {
  const args = argv.slice(2);
  const pi = args.indexOf('--phase');
  const phase = pi >= 0 ? args.splice(pi, 2)[1] : 'intake';
  const si = args.indexOf('--size');
  const statePath = join('.shipwright', 'state.json');
  const size = si >= 0 ? args.splice(si, 2)[1] : existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')).size ?? null : null;
  const testDirs = [];
  for (let ti; (ti = args.indexOf('--tests')) >= 0;) testDirs.push(args.splice(ti, 2)[1]);
  if (phase === 'qa' && !testDirs.length) testDirs.push('tests');
  const dir = args[0] ?? 'docs';
  if (!PHASES.includes(phase) || !existsSync(dir) || (size && !BUDGETS[size])) {
    console.error(`usage: trace.mjs [docsDir] [--phase ${PHASES.join('|')}] [--size S|M|L] [--tests <dir>]...  (size defaults to .shipwright/state.json)`);
    return 2;
  }
  const files = collectFiles(dir).map((p) => ({ path: relative(process.cwd(), p), text: readFileSync(p, 'utf8') }));
  const parsed = parse(files);
  const problems = check(parsed, phase, phase === 'qa' ? collectTestIds(testDirs) : null, size);
  if (problems.length) {
    console.log(`shipwright trace (${phase}): ${problems.length} problem(s)`);
    for (const p of problems) console.log(`  - ${p}`);
    return 1;
  }
  console.log(`shipwright trace (${phase}): OK — ${parsed.items.size} items traced`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv));
