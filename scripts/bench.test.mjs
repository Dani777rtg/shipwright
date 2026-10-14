import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { score, compare } from './bench.mjs';

test('score a mission folder and compare two scores', () => {
  const root = mkdtempSync(join(tmpdir(), 'sw-'));
  mkdirSync(join(root, '.shipwright'));
  writeFileSync(join(root, '.shipwright', 'state.json'), '{"docsDir":"docs"}');
  mkdirSync(join(root, 'docs'), { recursive: true });
  writeFileSync(join(root, 'docs', 'spec.md'), '- O-1: x\n');
  writeFileSync(join(root, 'docs', 'verify.md'), '**SHIP** — todo en verde\n');
  writeFileSync(join(root, 'docs', 'metrics.md'),
    '| 2026-10-13T10:00:00.000Z | spec | start |  |\n| 2026-10-13T12:00:00.000Z | spec | gate-approved |  |\n');
  const s = score(root);
  assert.equal(s.artifacts, '2/2');
  assert.equal(s.verdict, 'SHIP');
  assert.equal(s.hours, 2);
  assert.equal(s.gateRounds, 1);
  assert.equal(s.overBudget, 0);
  assert.ok(s.docWords > 0);
  assert.deepEqual(s.ids, { O: 1 });

  assert.equal(compare(s, { ...s, hours: 5 }).hours[2], 'worse');
  assert.equal(compare({ ...s, hours: 5 }, s).hours[2], 'better-or-equal');
  assert.equal(compare(s, { ...s, verdict: 'NO SHIP' }).verdict[2], 'worse');
  assert.equal(compare(s, { ...s, overBudget: 2 }).overBudget[2], 'worse');
  assert.equal(compare(s, { ...s, docWords: s.docWords * 3 }).docWords[2], 'worse');
  assert.equal(compare(s, { ...s, artifacts: '1/2' }).artifacts[2], 'worse');
});
