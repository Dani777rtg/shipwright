#!/usr/bin/env node
// Feedback from every mission console to the Shipwright maintainer: a report becomes an issue in a PRIVATE repo
// (mission feedback can hold client details; the Shipwright repo is public) and is always kept in a local inbox too,
// so nothing is lost when gh is missing, logged out or has no access.
// Usage:
//   node feedback.mjs save <report.md>   (from the mission's project root) save to the inbox and open the issue
//   node feedback.mjs inbox              list pending local reports and open issues (prints nothing when there are none)
//   node feedback.mjs done <file>        move a processed local report to done/
// Inbox: $SHIPWRIGHT_FEEDBACK_DIR or ~/.claude/shipwright/feedback · repo: $SHIPWRIGHT_FEEDBACK_REPO or the default below
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync } from 'node:fs';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

export const inboxDir = () => process.env.SHIPWRIGHT_FEEDBACK_DIR ?? join(homedir(), '.claude', 'shipwright', 'feedback');
const repo = () => process.env.SHIPWRIGHT_FEEDBACK_REPO ?? 'Dani777rtg/shipwright-feedback';
const gh = (args) => execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 20000 }).trim();

// Only into a repo gh confirms is private; returns the issue URL or null.
export function openIssue(file, run = gh) {
  try {
    if (run(['repo', 'view', repo(), '--json', 'isPrivate', '-q', '.isPrivate']) !== 'true') return null;
    const title = (readFileSync(file, 'utf8').match(/^# (.+)$/m)?.[1] ?? basename(file)).slice(0, 120);
    return run(['issue', 'create', '-R', repo(), '--title', title, '--body-file', file]);
  } catch { return null; }
}
const version = () => JSON.parse(readFileSync(new URL('../.claude-plugin/plugin.json', import.meta.url), 'utf8')).version;

export function save(root, reportPath, now = new Date()) {
  const statePath = join(root, '.shipwright', 'state.json');
  const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : {};
  const slug = basename(root).replace(/[^A-Za-z0-9]+/g, '-').toLowerCase();
  const stamp = now.toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
  const header = [
    `<!-- project: ${root} · shipwright: ${version()} · phase: ${state.phase ?? 'none'} · mission: ${state.mission ?? '-'} · ${now.toISOString()} -->`,
    '',
  ].join('\n');
  mkdirSync(inboxDir(), { recursive: true });
  const out = join(inboxDir(), `${slug}-${stamp}.md`);
  writeFileSync(out, header + readFileSync(reportPath, 'utf8'));
  return out;
}

export function inbox() {
  if (!existsSync(inboxDir())) return [];
  return readdirSync(inboxDir()).filter((f) => f.endsWith('.md')).sort().map((f) => join(inboxDir(), f));
}

export function done(file) {
  mkdirSync(join(inboxDir(), 'done'), { recursive: true });
  renameSync(join(inboxDir(), basename(file)), join(inboxDir(), 'done', basename(file)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [cmd, arg] = process.argv.slice(2);
  if (cmd === 'save' && arg) {
    const out = save(process.cwd(), arg);
    const url = openIssue(out);
    console.log(url ? `${out}\n${url}` : `${out}\n(no issue: private repo ${repo()} not reachable with gh — kept locally)`);
  } else if (cmd === 'inbox') {
    const files = inbox();
    if (files.length) console.log(`Shipwright feedback pending (${files.length}) — read each, turn it into framework changes, then \`node scripts/feedback.mjs done <file>\`:\n${files.join('\n')}`);
    let issues = '';
    try { issues = gh(['issue', 'list', '-R', repo(), '--state', 'open']); } catch { /* gh missing or no access */ }
    if (issues) console.log(`Open feedback issues in ${repo()} (close each once handled):\n${issues}`);
  } else if (cmd === 'done' && arg) done(arg);
  else { console.error('usage: feedback.mjs save <report.md> | inbox | done <file>'); process.exit(1); }
}
