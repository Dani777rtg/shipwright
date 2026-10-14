#!/usr/bin/env node
// shipwright trace — deterministic objective-traceability check (METODO.md §4).
// Usage: node trace.mjs [docsDir=docs] [--phase intake|architect|plan]
// Exit 0 = ok, 1 = violations (printed), 2 = usage error.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const ID = String.raw`(?:O-\d+|KR-\d+|QG-\d+|QS-\d+|ADR-\d+|C-\d+|US-\d+|AC-\d+\.\d+|T\d{3,})`;
const DEF_RE = new RegExp(String.raw`^\s*(?:#{1,6}\s+|[-*]\s+)(?:\*\*)?(${ID})\b`);
const SERVES_RE = /serves:\s*([^\n]*)/i;
const NOT_APPLICABLE_RE = /no aplica:|not applicable:/i;

const kindOf = (id) => id.match(/^[A-Z]+/)[0];

// Which kinds each kind may serve. M is the root; O serves the mission implicitly.
const ALLOWED = {
  KR: ['O'], QG: ['O', 'KR'], US: ['O'], AC: ['O', 'US'],
  QS: ['QG'], ADR: ['QS'], C: ['ADR', 'US', 'QS'], T: ['AC', 'QS'],
};

// Downward coverage required at each phase gate: [parent, child kinds that must serve it].
const COVERAGE = {
  intake: [['O', ['KR']], ['O', ['AC']]],
  architect: [['QG', ['QS']], ['QS', ['ADR', 'C']]],
  plan: [['AC', ['T']], ['QS', ['T']]],
};
const PHASES = Object.keys(COVERAGE);

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
  return { items, errors };
}

export function check({ items, errors }, phase = 'intake') {
  const out = [...errors];
  const where = (it) => `${it.path}:${it.line} ${it.id}`;
  for (const it of items.values()) {
    const allowed = ALLOWED[it.kind];
    if (!allowed) continue;
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
    for (const [parent, kinds] of COVERAGE[p]) {
      for (const it of items.values()) {
        if (it.kind !== parent || it.na) continue;
        const have = children.get(it.id) ?? new Set();
        if (!kinds.some((k) => have.has(k))) out.push(`${where(it)} not covered: needs at least one ${kinds.join(' or ')} serving it`);
      }
    }
  }
  if (![...items.values()].some((it) => it.kind === 'O')) out.push('no objectives (O-n) defined');
  if (![...items.values()].some((it) => it.kind === 'QG')) out.push('no quality goals (QG-n) defined');
  return out;
}

function main(argv) {
  const args = argv.slice(2);
  const pi = args.indexOf('--phase');
  const phase = pi >= 0 ? args.splice(pi, 2)[1] : 'intake';
  const dir = args[0] ?? 'docs';
  if (!PHASES.includes(phase) || !existsSync(dir)) {
    console.error(`usage: trace.mjs [docsDir] [--phase ${PHASES.join('|')}]`);
    return 2;
  }
  const files = collectFiles(dir).map((p) => ({ path: relative(process.cwd(), p), text: readFileSync(p, 'utf8') }));
  const parsed = parse(files);
  const problems = check(parsed, phase);
  if (problems.length) {
    console.log(`shipwright trace (${phase}): ${problems.length} problem(s)`);
    for (const p of problems) console.log(`  - ${p}`);
    return 1;
  }
  console.log(`shipwright trace (${phase}): OK — ${parsed.items.size} items traced`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv));
