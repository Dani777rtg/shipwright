#!/usr/bin/env node
// UserPromptExpansion hook: when the user runs /shipwright:<phase>, log "<phase> start" in the mission metrics.
// Never blocks: any problem exits 0 silently. Mission start is logged by the mission skill itself,
// because the docs directory does not exist until the mission creates .shipwright/state.json.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PHASES, docsDir, log } from '../metrics.mjs';

export function phaseOf(input) {
  if (input?.expansion_type !== 'slash_command') return null;
  const name = String(input.command_name ?? '');
  if (!/^(shipwright:)?[a-z]+$/.test(name)) return null;
  if (!name.startsWith('shipwright:') && input.command_source !== 'plugin') return null;
  const phase = name.replace('shipwright:', '');
  return PHASES.includes(phase) && phase !== 'mission' ? phase : null;
}

function main() {
  try {
    const input = JSON.parse(readFileSync(0, 'utf8'));
    const phase = phaseOf(input);
    const root = input.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
    if (phase && existsSync(join(root, '.shipwright', 'state.json'))) log(join(docsDir(root), 'metrics.md'), phase, 'start');
  } catch { /* metrics must never block the user */ }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main());
