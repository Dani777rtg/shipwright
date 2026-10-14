import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { log, summarize } from './metrics.mjs';

test('log + summarize: hours until approval, gate rounds counted', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'sw-')), 'docs', 'metrics.md');
  const at = (h) => new Date(Date.UTC(2026, 9, 13, h));
  log(file, 'intake', 'start', '', at(10));
  log(file, 'intake', 'gate-changes', 'faltan KR | x', at(11));
  log(file, 'intake', 'gate-approved', '', at(12));
  log(file, 'architect', 'start', '', at(12));
  const s = summarize(readFileSync(file, 'utf8'));
  assert.deepEqual(s.intake, { hours: 2, gateRounds: 2 });
  assert.deepEqual(s.architect, { hours: 0, gateRounds: 0 });
  assert.throws(() => log(file, 'nope', 'start'));
});
