import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isApproved } from './protect-approved.mjs';

const hook = fileURLToPath(new URL('./protect-approved.mjs', import.meta.url));
const run = (input) => spawnSync(process.execPath, [hook], { input: JSON.stringify(input), encoding: 'utf8' });

test('isApproved reads only frontmatter status', () => {
  assert.equal(isApproved('---\nstatus: approved\n---\n# x'), true);
  assert.equal(isApproved('---\r\nstatus: approved\r\n---\r\n# x'), true);
  assert.equal(isApproved('---\nstatus: draft\n---\nstatus: approved'), false);
  assert.equal(isApproved('# no frontmatter'), false);
});

test('hook blocks approved file and allows draft / missing / malformed input', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sw-'));
  writeFileSync(join(dir, 'a.md'), '---\nstatus: approved\n---\n');
  writeFileSync(join(dir, 'd.md'), '---\nstatus: draft\n---\n');
  const blocked = run({ cwd: dir, tool_name: 'Edit', tool_input: { file_path: 'a.md' } });
  assert.equal(blocked.status, 2);
  assert.match(blocked.stderr, /shipwright:change/);
  assert.equal(run({ cwd: dir, tool_input: { file_path: 'd.md' } }).status, 0);
  assert.equal(run({ cwd: dir, tool_input: { file_path: 'new.md' } }).status, 0);
  assert.equal(spawnSync(process.execPath, [hook], { input: 'not json' }).status, 0);
});
