#!/usr/bin/env node
// Feedback inbox shared by every console on this machine: a mission console saves a report, the console working on
// the Shipwright repo lists and closes them. Local files only — mission feedback can hold client details, and the
// Shipwright repo is public.
// Usage:
//   node feedback.mjs save <report.md>   (from the mission's project root) copy the report into the inbox with a header
//   node feedback.mjs inbox              list pending reports (prints nothing when there are none)
//   node feedback.mjs done <file>        move a processed report to done/
// Inbox: $SHIPWRIGHT_FEEDBACK_DIR or ~/.claude/shipwright/feedback
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync } from 'node:fs';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';

export const inboxDir = () => process.env.SHIPWRIGHT_FEEDBACK_DIR ?? join(homedir(), '.claude', 'shipwright', 'feedback');
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
  if (cmd === 'save' && arg) console.log(save(process.cwd(), arg));
  else if (cmd === 'inbox') {
    const files = inbox();
    if (files.length) console.log(`Shipwright feedback pending (${files.length}) — read each, turn it into framework changes, then \`node scripts/feedback.mjs done <file>\`:\n${files.join('\n')}`);
  } else if (cmd === 'done' && arg) done(arg);
  else { console.error('usage: feedback.mjs save <report.md> | inbox | done <file>'); process.exit(1); }
}
