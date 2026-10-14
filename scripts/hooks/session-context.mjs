#!/usr/bin/env node
// SessionStart hook (startup | resume | clear | compact): inside a Shipwright project, add a short reminder of the
// active mission, its phase and the next command, so a fresh or compacted session continues without losing the thread.
// Never blocks; prints nothing outside Shipwright projects.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const NEXT = {
  mission: '/shipwright:mission (confirm the mission card)', intake: '/shipwright:intake', architect: '/shipwright:architect',
  plan: '/shipwright:plan', build: '/shipwright:build (resumes from the last finished task)', qa: '/shipwright:qa',
  ship: '/shipwright:ship', retro: '/shipwright:retro', done: 'none — mission closed',
};

export function context(root) {
  const path = join(root, '.shipwright', 'state.json');
  if (!existsSync(path)) return null;
  let s;
  try { s = JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
  const lines = [
    `Shipwright mission active: ${s.mission ?? '(unnamed)'}`,
    `Phase: ${s.phase ?? 'unknown'} · size: ${s.size ?? 'L'} · docs: ${s.docsDir ?? 'docs'} · next: ${NEXT[s.phase] ?? '/shipwright:status'}`,
  ];
  if (s.change) lines.push(`Open change: ${s.change.id} (files: ${s.change.files.join(', ')}) — finish it with /shipwright:change.`);
  if (s.tasksDone?.length) lines.push(`Tasks done: ${s.tasksDone.length}`);
  const plugin = process.env.CLAUDE_PLUGIN_ROOT ?? fileURLToPath(new URL('../..', import.meta.url));
  lines.push(`All mission state is in files; read them instead of relying on earlier conversation. Engineering principles: ${join(plugin, 'reference', 'engineering-principles.md')}`);
  return lines.join('\n');
}

function main() {
  try {
    const input = JSON.parse(readFileSync(0, 'utf8'));
    const text = context(input.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
    if (text) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text } }));
  } catch { /* never block a session */ }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main());
