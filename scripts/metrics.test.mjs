import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { log, summarize } from './metrics.mjs';

test('log + summarize: hours until approval, gate rounds counted', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'sw-')), 'docs', 'metrics.md');
  const at = (h) => new Date(Date.UTC(2026, 9, 13, h));
  log(file, 'spec', 'start', '', at(10));
  log(file, 'spec', 'gate-changes', 'faltan KR | x', at(11));
  log(file, 'spec', 'gate-approved', '', at(12));
  log(file, 'build', 'start', '', at(12));
  log(file, 'build', 'ecc', 'agents/code-reviewer.md', at(12));
  const s = summarize(readFileSync(file, 'utf8'));
  assert.deepEqual(s.spec, { hours: 2, gateRounds: 2, ecc: [] });
  assert.deepEqual(s.build, { hours: 0, gateRounds: 0, ecc: ['agents/code-reviewer.md'] });
  assert.throws(() => log(file, 'nope', 'start'));
});
