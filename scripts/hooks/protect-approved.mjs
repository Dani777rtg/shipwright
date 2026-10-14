#!/usr/bin/env node
// PreToolUse hook (Write|Edit|MultiEdit): block edits to artifacts whose frontmatter says `status: approved`.
// Approved specs only change through /shipwright:change (METODO.md §5). Guardrail against drift, not a security boundary.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function isApproved(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return !!fm && /^status:\s*approved\s*$/m.test(fm[1]);
}

function main() {
  let input;
  try { input = JSON.parse(readFileSync(0, 'utf8')); } catch { return 0; }
  const file = input?.tool_input?.file_path;
  if (!file) return 0;
  const path = resolve(input.cwd ?? process.cwd(), file);
  if (!existsSync(path) || !isApproved(readFileSync(path, 'utf8'))) return 0;
  process.stderr.write(
    `Shipwright: ${file} is approved (status: approved). ` +
    'Approved artifacts change only through /shipwright:change, which records a delta and asks the user for approval.\n'
  );
  return 2;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main());
