import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { analyze, render, family, transcriptsDir } from './session-report.mjs';

const at = (min) => new Date(Date.UTC(2026, 9, 14, 10, min)).toISOString();
const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';

test('family groups shell commands', () => {
  assert.equal(family('Bash', 'npx vitest run apps/api'), 'tests');
  assert.equal(family('PowerShell', 'pnpm typecheck'), 'typecheck');
  assert.equal(family('Bash', 'pnpm install --offline'), 'install');
  assert.equal(family('Bash', 'git commit -m x'), 'git');
  assert.equal(family('Edit'), 'Edit');
  assert.match(transcriptsDir('C:\\Users\\x\\sistema taller'), /C--Users-x-sistema-taller$/);
});

test('active vs idle time, subagents and builder tool families', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sw-tr-'));
  writeFileSync(join(dir, 'abcd1234.jsonl'), jsonl([
    { type: 'user', timestamp: at(0), message: { content: 'empieza' } },
    { type: 'assistant', timestamp: at(5), message: { content: [{ type: 'text', text: 'ok' }] } },
    { type: 'user', timestamp: at(45), message: { content: 'sigue' } }, // 40 min idle
    { type: 'assistant', timestamp: at(47), message: { content: [] } },
  ]));
  const sub = join(dir, 'abcd1234', 'subagents');
  mkdirSync(sub, { recursive: true });
  writeFileSync(join(sub, 'agent-1.meta.json'), JSON.stringify({ agentType: 'shipwright:builder' }));
  writeFileSync(join(sub, 'agent-1.jsonl'), jsonl([
    { type: 'assistant', timestamp: at(10), message: { id: 'm1', usage: { input_tokens: 10, cache_read_input_tokens: 20000, cache_creation_input_tokens: 0 }, content: [{ type: 'tool_use', id: 't1', name: 'Bash', input: { command: 'npx vitest run' } }] } },
    { type: 'assistant', timestamp: at(10), message: { id: 'm1', usage: { input_tokens: 10, cache_read_input_tokens: 20000, cache_creation_input_tokens: 0 }, content: [{ type: 'text', text: 'same message, second block' }] } },
    { type: 'user', timestamp: at(13), message: { content: [{ type: 'tool_result', tool_use_id: 't1' }] } },
    { type: 'assistant', timestamp: at(14), message: { id: 'm2', usage: { input_tokens: 0, cache_read_input_tokens: 25000, cache_creation_input_tokens: 990 }, content: [{ type: 'tool_use', id: 't2', name: 'Edit', input: {} }] } },
    { type: 'user', timestamp: at(15), message: { content: [{ type: 'tool_result', tool_use_id: 't2' }] } },
  ]));
  const r = analyze(dir);
  assert.equal(r.sessions.length, 1);
  assert.equal(r.sessions[0].active, 7 * 6e4);
  assert.equal(r.sessions[0].idle, 40 * 6e4);
  assert.equal(r.sessions[0].prompts, 2);
  assert.deepEqual(r.agents['shipwright:builder'], { count: 1, ms: 5 * 6e4, tokens: 46000, turns: 2, firstTurn: 20010 });
  assert.deepEqual(r.builderTools.tests, { calls: 1, ms: 3 * 6e4 });
  assert.match(render(r), /\| tests \| 1 \| 3 \| 75 % \|/);
  assert.equal(analyze(dir, at(30)).sessions[0].prompts, 1);
});
