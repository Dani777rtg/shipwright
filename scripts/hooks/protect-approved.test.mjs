import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isApproved, lockedBy, shellWritesLocked } from './protect-approved.mjs';

const hook = fileURLToPath(new URL('./protect-approved.mjs', import.meta.url));
const run = (input) => spawnSync(process.execPath, [hook], { input: JSON.stringify(input), encoding: 'utf8' });

test('isApproved reads only frontmatter status', () => {
  assert.equal(isApproved('---\nstatus: approved\n---\n# x'), true);
  assert.equal(isApproved('---\r\nstatus: approved\r\n---\r\n# x'), true);
  assert.equal(isApproved('---\nstatus: draft\n---\nstatus: approved'), false);
  assert.equal(isApproved('# no frontmatter'), false);
  assert.equal(isApproved('---\nstatus: accepted\n---\n# ADR-1'), true);
  assert.equal(isApproved('---\nstatus: proposed\n---\n# ADR-1'), false);
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

test('lockedBy matches glob patterns', () => {
  const locks = ['tests/acceptance/**', 'e2e/*.spec.ts'];
  assert.equal(lockedBy('tests/acceptance/login/AC-01.1.test.ts', locks), 'tests/acceptance/**');
  assert.equal(lockedBy(String.raw`tests\acceptance\x.py`, locks), 'tests/acceptance/**');
  assert.equal(lockedBy('e2e/login.spec.ts', locks), 'e2e/*.spec.ts');
  assert.equal(lockedBy('e2e/deep/login.spec.ts', locks), null);
  assert.equal(lockedBy('src/app.ts', locks), null);
  assert.equal(lockedBy('src/app.ts'), null);
});

test('hook blocks locked paths from state.json', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sw-'));
  mkdirSync(join(dir, '.shipwright'));
  writeFileSync(join(dir, '.shipwright', 'state.json'), JSON.stringify({ lockedPaths: ['tests/acceptance/**'] }));
  const r = run({ cwd: dir, tool_input: { file_path: join(dir, 'tests', 'acceptance', 'a.test.ts') } });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /locked/);
  assert.equal(run({ cwd: dir, tool_input: { file_path: 'src/a.ts' } }).status, 0);
});

test('shellWritesLocked: blocks writes, allows reads and runs', () => {
  const root = '/p';
  const L = ['tests/acceptance/**'];
  const w = (cmd) => shellWritesLocked(cmd, root, root, L);
  for (const cmd of [
    'echo x > tests/acceptance/a.test.ts',
    'cat fix.txt >> tests/acceptance/a.test.ts',
    "sed -i 's/expect/skip/' tests/acceptance/a.test.ts",
    'rm -rf tests/acceptance',
    'cd x && mv tests/acceptance/a.py tmp.py',
    'git checkout -- tests/acceptance/a.py',
    'Set-Content -Path tests/acceptance/a.ps1 -Value x',
  ]) assert.equal(w(cmd), 'tests/acceptance/**', cmd);
  for (const cmd of [
    'pytest tests/acceptance > out.txt',
    'npx vitest run tests/acceptance',
    'cat tests/acceptance/a.test.ts',
    'grep -r expect tests/acceptance | wc -l',
    "sed -n '1,5p' tests/acceptance/a.py",
    'echo x > src/a.ts',
  ]) assert.equal(w(cmd), null, cmd);
  assert.equal(shellWritesLocked('rm -rf tests/acceptance', root, root, []), null);
});

test('hook blocks shell writes to locked paths', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sw-'));
  mkdirSync(join(dir, '.shipwright'));
  writeFileSync(join(dir, '.shipwright', 'state.json'), JSON.stringify({ lockedPaths: ['tests/acceptance/**'] }));
  assert.equal(run({ cwd: dir, tool_name: 'Bash', tool_input: { command: 'echo x > tests/acceptance/a.py' } }).status, 2);
  assert.equal(run({ cwd: dir, tool_name: 'Bash', tool_input: { command: 'pytest tests/acceptance' } }).status, 0);
});
