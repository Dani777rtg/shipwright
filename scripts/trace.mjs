#!/usr/bin/env node
// shipwright trace — deterministic traceability and proportionality check (METODO.md §3).
// Usage: node trace.mjs [docsDir=docs] [--phase spec|verify] [--tests <dir>]...
// Exit 0 = ok, 1 = problems (printed), 2 = usage error.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const ID = String.raw`(?:O-\d+|US-\d+|AC-\d+\.\d+|TM-\d+|T\d{3,})`;
const DEF_RE = new RegExp(String.raw`^\s*(?:#{1,6}\s+|[-*]\s+)(?:\*\*)?(${ID})\b`);
const SERVES_RE = /serves:\s*([^\n—]*)/i;
const RISK_RE = /^\s*riesgo:\s*(alto|bajo)\s+(?:—|--)\s+\S.{9,}/im;
const NOT_APPLICABLE_RE = /no aplica:|not applicable:|riesgo aceptado:|accepted risk:/i;
const WAIVER_RE = /presupuesto excedido:\s*([A-Z]+)\s+(?:—|--)\s+\S.{9,}/gi;

const kindOf = (id) => id.match(/^[A-Z]+/)[0];

// Which kinds each kind may serve. O is the root.
const ALLOWED = { US: ['O'], AC: ['US'], TM: ['US'], T: ['AC', 'TM'] };

// Downward coverage required: every parent needs at least one child of these kinds serving it.
const COVERAGE = [['O', ['US']], ['US', ['AC']], ['AC', ['T']], ['TM', ['T']]];

// Proportionality: limits per story (and per mission for stories). Exceeding one needs a written waiver line
// "Presupuesto excedido: <KIND> — <reason>" in any mission document, shown to the user at the gate.
export const BUDGET = { US: 12, AC_PER_US: 6, T_PER_US: 3, TM_PER_HIGH_US: 4 };

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
      } else if (/^\s*#{1,6}\s/.test(line)) current = null; // a heading closes the item
      else if (current) current.body.push(line);
    });
  }
  for (const it of items.values()) {
    const text = it.body.join('\n');
    it.na = NOT_APPLICABLE_RE.test(text);
    it.risk = text.match(RISK_RE)?.[1]?.toLowerCase() ?? null;
    const s = text.match(SERVES_RE);
    it.serves = s ? s[1].split(/[,\s]+/).map((r) => r.replace(/[[\]`*]/g, '')).filter(Boolean) : null;
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
      else for (const m of readFileSync(p, 'utf8').matchAll(/(?<![A-Za-z0-9])(AC[-_]\d+[._]\d+|TM[-_]\d+)(?![0-9])/g)) ids.add(m[1].replace('_', '-').replace(/(AC-\d+)_/, '$1.'));
    }
  };
  for (const d of dirs.filter(existsSync)) walk(d);
  return ids;
}

// TM evidence may also be a verify-report line such as "TM-2 … evidencia: test_rate_limit".
const evidenced = (texts) => new Set(texts.flatMap((t) => t.split(/\r?\n/))
  .flatMap((l) => /evidencia:|evidence:/i.test(l) ? [...l.matchAll(/(?<![A-Za-z0-9])TM-\d+(?![0-9])/g)].map((m) => m[0]) : []));

export function overBudget(items, texts) {
  const waived = new Set(texts.flatMap((t) => [...t.matchAll(WAIVER_RE)].map((m) => m[1].toUpperCase())));
  const all = [...items.values()];
  const children = (us, kind) => all.filter((it) => it.kind === kind && it.serves?.includes(us.id));
  const out = [];
  const stories = all.filter((it) => it.kind === 'US');
  if (stories.length > BUDGET.US && !waived.has('US')) out.push(`${stories.length} US (max ${BUDGET.US})`);
  for (const us of stories) {
    const acs = children(us, 'AC');
    const tasks = all.filter((it) => it.kind === 'T' && it.serves?.some((r) => r === us.id || acs.some((a) => a.id === r)));
    const tms = children(us, 'TM');
    if (acs.length > BUDGET.AC_PER_US && !waived.has('AC')) out.push(`${us.id}: ${acs.length} AC (max ${BUDGET.AC_PER_US})`);
    if (tasks.length > BUDGET.T_PER_US && !waived.has('T')) out.push(`${us.id}: ${tasks.length} T (max ${BUDGET.T_PER_US})`);
    if (tms.length > BUDGET.TM_PER_HIGH_US && !waived.has('TM')) out.push(`${us.id}: ${tms.length} TM (max ${BUDGET.TM_PER_HIGH_US})`);
  }
  return out.map((p) => `over budget: ${p} — reduce it, or add "Presupuesto excedido: <KIND> — <why>"`);
}

export function check({ items, errors, texts = [] }, phase = 'spec', testIds = null) {
  const out = [...errors];
  const where = (it) => `${it.path}:${it.line} ${it.id}`;
  for (const it of items.values()) {
    const allowed = ALLOWED[it.kind];
    if (it.kind === 'US' && !it.risk) out.push(`${where(it)} missing "riesgo: alto|bajo — <why>" (METODO.md §3)`);
    if (!allowed) continue;
    if (!it.serves?.length) { out.push(`${where(it)} orphan: missing "serves: <ID>"`); continue; }
    for (const ref of it.serves) {
      const target = items.get(ref);
      if (!target) out.push(`${where(it)} serves unknown ID ${ref}`);
      else if (!allowed.includes(target.kind)) out.push(`${where(it)} cannot serve ${ref} (${it.kind} may serve: ${allowed.join(', ')})`);
      else if (it.kind === 'TM' && target.risk === 'bajo') out.push(`${where(it)} threat on low-risk ${ref}: threats are written only for riesgo alto stories`);
    }
  }
  const covered = new Map();
  for (const it of items.values()) for (const ref of it.serves ?? []) {
    if (!covered.has(ref)) covered.set(ref, new Set());
    covered.get(ref).add(it.kind);
  }
  for (const [parent, kinds] of COVERAGE) {
    for (const it of items.values()) {
      if (it.kind !== parent || it.na) continue;
      if (!kinds.some((k) => covered.get(it.id)?.has(k))) out.push(`${where(it)} not covered: needs at least one ${kinds.join(' or ')} serving it`);
    }
  }
  if (phase === 'verify') {
    const tested = testIds ?? new Set();
    const withEvidence = evidenced(texts);
    for (const it of items.values()) {
      if (it.na) continue;
      if (it.kind === 'AC' && !tested.has(it.id)) out.push(`${where(it)} untested: no test cites ${it.id}`);
      if (it.kind === 'TM' && !tested.has(it.id) && !withEvidence.has(it.id)) out.push(`${where(it)} no evidence: cite ${it.id} in a test or in a verify report line with "evidencia:"`);
    }
  }
  out.push(...overBudget(items, texts));
  if (![...items.values()].some((it) => it.kind === 'O')) out.push('no objectives (O-n) defined');
  return out;
}

function main(argv) {
  const args = argv.slice(2);
  const pi = args.indexOf('--phase');
  const phase = pi >= 0 ? args.splice(pi, 2)[1] : 'spec';
  const testDirs = [];
  for (let ti; (ti = args.indexOf('--tests')) >= 0;) testDirs.push(args.splice(ti, 2)[1]);
  if (phase === 'verify' && !testDirs.length) testDirs.push('tests');
  const dir = args[0] ?? 'docs';
  if (!['spec', 'verify'].includes(phase) || !existsSync(dir)) {
    console.error('usage: trace.mjs [docsDir] [--phase spec|verify] [--tests <dir>]...');
    return 2;
  }
  const files = collectFiles(dir).map((p) => ({ path: relative(process.cwd(), p), text: readFileSync(p, 'utf8') }));
  const parsed = parse(files);
  const problems = check(parsed, phase, phase === 'verify' ? collectTestIds(testDirs) : null);
  if (problems.length) {
    console.log(`shipwright trace (${phase}): ${problems.length} problem(s)`);
    for (const p of problems) console.log(`  - ${p}`);
    return 1;
  }
  console.log(`shipwright trace (${phase}): OK — ${parsed.items.size} items traced`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv));
