import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse, check, collectTestIds } from './trace.mjs';

const spec = `# Spec
## Objetivos
- O-1: Cuando sale de una reunión, el asistente quiere un resumen — medida: resumen en <= 60 s
## Historias
### US-01 Resumir audio (Must)
serves: O-1
riesgo: alto — procesa audio con datos personales
- **AC-01.1** WHEN the user uploads audio THE SYSTEM SHALL show a summary
  serves: US-01
## Amenazas
- TM-1: el audio de otro usuario se filtra — serves: US-01
## Tareas
### T001 [US-01] Subir y resumir
serves: AC-01.1, TM-1
`;
const run = (files, phase = 'spec', testIds) => check(parse(files.map(([path, text]) => ({ path, text }))), phase, testIds);

test('valid spec passes', () => {
  assert.deepEqual(run([['spec.md', spec]]), []);
});

test('orphans, unknown IDs and wrong kinds are rejected', () => {
  const bad = spec.replace('  serves: US-01', '  serves: O-1') + '### T002 [US-01] x\nserves: AC-09.9\n';
  const out = run([['spec.md', bad]]);
  assert.ok(out.some((p) => p.includes('AC-01.1 cannot serve O-1')));
  assert.ok(out.some((p) => p.includes('T002 serves unknown ID AC-09.9')));
  assert.ok(run([['spec.md', spec.replace('serves: O-1\n', '')]]).some((p) => p.includes('US-01 orphan')));
});

test('coverage: every O, US, AC and TM needs a child', () => {
  const noTask = spec.slice(0, spec.indexOf('## Tareas'));
  const out = run([['spec.md', noTask]]);
  assert.ok(out.some((p) => p.includes('AC-01.1 not covered')));
  assert.ok(out.some((p) => p.includes('TM-1 not covered')));
});

test('risk: every story needs it, and threats only on high-risk stories', () => {
  assert.ok(run([['spec.md', spec.replace(/riesgo: alto.*\r?\n/, '')]]).some((p) => p.includes('US-01 missing "riesgo:')));
  const low = spec.replace('riesgo: alto — procesa audio con datos personales', 'riesgo: bajo — solo cambia un texto en pantalla');
  assert.ok(run([['spec.md', low]]).some((p) => p.includes('TM-1 threat on low-risk US-01')));
});

test('budget per story, waivable with a written reason', () => {
  const many = spec + ['002', '003', '004', '005'].map((n) => `### T${n} [US-01] más\nserves: AC-01.1\n`).join('');
  assert.ok(run([['spec.md', many]]).some((p) => p.includes('US-01: 5 T (max 3)')));
  const waived = many + '\nPresupuesto excedido: T — la integración con el banco exige pasos separados\n';
  assert.ok(!run([['spec.md', waived]]).some((p) => p.includes('over budget')));
});

test('duplicate definition is reported; No aplica waives coverage', () => {
  assert.ok(run([['spec.md', spec], ['dup.md', '- O-1: otra vez\n']]).some((p) => p.includes('O-1 defined twice')));
  const na = spec.replace('- TM-1: el audio de otro usuario se filtra — serves: US-01', '- TM-1: x — serves: US-01 — Riesgo aceptado: demo sin datos reales')
    .replace('serves: AC-01.1, TM-1', 'serves: AC-01.1');
  assert.deepEqual(run([['spec.md', na]]), []);
});

test('verify: every AC needs a test citing it; TM needs a test or report evidence', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sw-'));
  mkdirSync(join(dir, 'acceptance'));
  writeFileSync(join(dir, 'acceptance', 'resumen.test.ts'), "test('AC-01.1 shows summary', () => {})\n");
  writeFileSync(join(dir, 'test_x.py'), 'def test_AC_01_2_rejects(): pass\nTM_3\n');
  assert.deepEqual([...collectTestIds([dir])].sort(), ['AC-01.1', 'AC-01.2', 'TM-3']);

  assert.ok(run([['spec.md', spec]], 'verify', new Set()).some((x) => x.includes('AC-01.1 untested')));
  assert.ok(run([['spec.md', spec]], 'verify', new Set(['AC-01.1'])).some((x) => x.includes('TM-1 no evidence')));
  const report = ['verify.md', '| TM-1 | mitigada | evidencia: test_aislamiento_audio |\n'];
  assert.deepEqual(run([['spec.md', spec], report], 'verify', new Set(['AC-01.1'])), []);
});
