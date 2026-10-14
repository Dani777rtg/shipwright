import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { score, compare } from './bench.mjs';

test('score a mission folder and compare two scores', () => {
  const root = mkdtempSync(join(tmpdir(), 'sw-'));
  mkdirSync(join(root, '.shipwright'));
  writeFileSync(join(root, '.shipwright', 'state.json'), '{"docsDir":"docs","size":"S"}');
  mkdirSync(join(root, 'docs', 'qa'), { recursive: true });
  writeFileSync(join(root, 'docs', 'mission.md'), '- O-1: x\n- QG-1: y — serves: O-1 — razón suficiente\n');
  writeFileSync(join(root, 'docs', 'qa', 'report.md'), '**SHIP** — todo en verde\n');
  writeFileSync(join(root, 'docs', 'metrics.md'),
    '| 2026-10-13T10:00:00.000Z | intake | start |  |\n| 2026-10-13T12:00:00.000Z | intake | gate-approved |  |\n');
  const s = score(root);
  assert.equal(s.artifacts, '2/4');
  assert.equal(s.size, 'S');
  assert.equal(s.overBudget, 0);
  assert.equal(s.verdict, 'SHIP');
  assert.equal(s.hours, 2);
  assert.equal(s.gateRounds, 1);
  assert.deepEqual(s.ids, { O: 1, QG: 1 });

  const worse = { ...s, hours: 5 };
  assert.equal(compare(s, worse).hours[2], 'worse');
  assert.equal(compare(worse, s).hours[2], 'better-or-equal');
  assert.equal(compare(s, { ...s, verdict: 'NO SHIP' }).verdict[2], 'worse');
  assert.equal(compare(s, { ...s, overBudget: 2 }).overBudget[2], 'worse');
  assert.equal(compare(s, { ...s, artifacts: '1/4' }).artifacts[2], 'worse');
  assert.equal(compare(s, { ...s, size: 'M' }).size[2], 'worse');
});
