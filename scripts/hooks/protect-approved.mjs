#!/usr/bin/env node
// PreToolUse hook (Write|Edit|MultiEdit|Bash|PowerShell): block edits to
//  - .shipwright/ (state, lock fingerprints): only Shipwright scripts write there;
//  - paths listed in `lockedPaths` of the state (acceptance tests written by the QA agent,
//    so the builder cannot weaken them to make them pass);
//  - artifacts whose frontmatter says `status: approved` or `accepted`.
// Files listed in state.change.files (opened by an approved /shipwright:change) may be edited.
// Shell commands (Bash|PowerShell) that write to a locked path are blocked by a heuristic; this is a guardrail
// against drift, not a security boundary.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';
import { pathToFileURL } from 'node:url';

function readState(root) {
  try { return JSON.parse(readFileSync(join(root, '.shipwright', 'state.json'), 'utf8')); } catch { return {}; }
}

export function isApproved(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return !!fm && /^status:\s*(approved|accepted)\s*$/m.test(fm[1]);
}

// Glob → RegExp: `**` any depth, `*` within one segment; a trailing `/**` also matches the directory itself.
export const globRe = (g) => {
  const dirAndBelow = g.endsWith('/**');
  const body = (dirAndBelow ? g.slice(0, -3) : g).split(/(\*\*\/?|\*)/).map((part) =>
    part === '**/' || part === '**' ? '.*' : part === '*' ? '[^/]*' : part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('');
  return new RegExp('^' + body + (dirAndBelow ? '(/.*)?' : '') + '$');
};

export function lockedBy(relPath, patterns = []) {
  const p = relPath.replace(/\\/g, '/');
  return patterns.find((g) => globRe(g).test(p)) ?? null;
}

// Words that write to the paths that follow them in the same shell segment.
const WRITERS = /^(rm|mv|cp|tee|truncate|dd|touch|unlink|set-content|add-content|out-file|remove-item|move-item|copy-item|new-item|clear-content)$/i;
const IN_PLACE = /^(sed|perl|gsed)$/i; // only with -i

// Returns the lock rule a shell command would write through, or null. Heuristic: redirection targets,
// arguments of writer commands, `sed -i`/`perl -i` arguments and `git checkout|restore|rm|mv` paths.
// Reading or running locked tests (`pytest tests/acceptance > out.txt`) is allowed.
export function shellWritesLocked(command, root, cwd, patterns = []) {
  if (!patterns.length) return null;
  const hit = (tok) => {
    const t = tok.replace(/^["']|["']$/g, '');
    return t && !t.startsWith('-') ? lockedBy(relative(root, resolve(cwd, t)), patterns) : null;
  };
  for (const seg of command.split(/&&|\|\||[;|&\n]/)) {
    for (const [, target] of seg.matchAll(/(?:^|[^<>&\d])\d?>>?\s*([^\s<>;|&]+)/g)) {
      const rule = hit(target);
      if (rule) return rule;
    }
    const words = seg.replace(/\d?>>?\s*[^\s<>;|&]+/g, ' ').trim().split(/\s+/);
    const i = words.findIndex((w, k) => WRITERS.test(w)
      || (IN_PLACE.test(w) && words.slice(k + 1).some((a) => /^-[a-z]*i/.test(a)))
      || (w === 'git' && /^(checkout|restore|rm|mv)$/.test(words[k + 1] ?? '')));
    if (i < 0) continue;
    for (const w of words.slice(i + 1)) {
      const rule = hit(w);
      if (rule) return rule;
    }
  }
  return null;
}

// Shipwright's own state is written only by its scripts (state.mjs, lock.mjs, change.mjs, install-packs.mjs).
export const ALWAYS_LOCKED = ['.shipwright/**'];

const MSG = {
  state: 'Shipwright state is changed only through Shipwright scripts (node .../scripts/state.mjs).',
  locked: 'Acceptance tests are owned by the QA agent; change the code, not the test. If the test itself is wrong, use /shipwright:change so the user approves it.',
  approved: 'Approved artifacts change only through /shipwright:change, which records a delta and asks the user for approval.',
};

// Decide for one tool call. Returns null (allow) or the reason to block.
export function decide(input, root) {
  if (!existsSync(join(root, '.shipwright', 'state.json'))) return null; // not a Shipwright project
  const state = readState(root);
  const cwd = input?.cwd ?? root;
  const locks = [...ALWAYS_LOCKED, ...(state.lockedPaths ?? [])];
  const opened = new Set((state.change?.files ?? []).map((f) => f.replace(/\\/g, '/')));
  const why = (rule) => rule === ALWAYS_LOCKED[0] ? MSG.state : MSG.locked;

  const command = input?.tool_input?.command;
  if (typeof command === 'string') {
    const rule = shellWritesLocked(command, root, cwd, locks);
    return rule ? `this command writes to a locked path (${rule}). ${why(rule)}` : null;
  }
  const file = input?.tool_input?.file_path;
  if (!file) return null;
  const path = resolve(cwd, file);
  const rel = relative(root, path).replace(/\\/g, '/');
  const rule = lockedBy(rel, locks);
  if (rule === ALWAYS_LOCKED[0]) return `${file} is locked. ${MSG.state}`;
  if (opened.has(rel)) return null; // opened by an approved /shipwright:change
  if (rule) return `${file} is locked (${rule}). ${MSG.locked}`;
  if (existsSync(path) && isApproved(readFileSync(path, 'utf8'))) return `${file} is approved. ${MSG.approved}`;
  return null;
}

function main() {
  let input;
  try { input = JSON.parse(readFileSync(0, 'utf8')); } catch { return 0; }
  const root = process.env.CLAUDE_PROJECT_DIR ?? input?.cwd ?? process.cwd();
  const reason = decide(input, root);
  if (!reason) return 0;
  process.stderr.write(`Shipwright: ${reason}\n`);
  return 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main());
