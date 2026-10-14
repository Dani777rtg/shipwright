#!/usr/bin/env node
// PostToolUse hook (Read): when an ECC agent, skill or command is read from the plugin's vendor/ecc/ during a
// mission, log "<phase> ecc <path>" in the mission metrics once per phase, so the retro sees which experts were used.
// Never blocks: any problem exits 0 silently.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PHASES, docsDir, log } from '../metrics.mjs';

export function eccPath(filePath) {
  const m = String(filePath ?? '').replace(/\\/g, '/')
    .match(/\/vendor\/ecc\/((?:agents|commands)\/[^/]+\.md|skills\/[^/]+(?=\/SKILL\.md$))/);
  return m ? m[1] : null;
}

function main() {
  try {
    const input = JSON.parse(readFileSync(0, 'utf8'));
    const path = eccPath(input.tool_input?.file_path);
    const root = input.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
    const state = join(root, '.shipwright', 'state.json');
    if (!path || !existsSync(state)) return 0;
    const { phase } = JSON.parse(readFileSync(state, 'utf8'));
    if (!PHASES.includes(phase)) return 0;
    const file = join(docsDir(root), 'metrics.md');
    if (existsSync(file) && readFileSync(file, 'utf8').includes(`| ${phase} | ecc | ${path} |`)) return 0;
    log(file, phase, 'ecc', path);
  } catch { /* metrics must never block the user */ }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main());
