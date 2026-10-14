import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse, check, collectTestIds } from './trace.mjs';

const mission = `# Misión M: demo
## Objetivos
- O-1: Cuando sale de una reunión, el asistente quiere un resumen
- KR-1: resumen en <= 60 s — serves: O-1 — mide la velocidad del resumen
## Calidad
- QG-1: Fiabilidad — serves: O-1 — sin fiabilidad no hay demo
`;
const reqs = `# Requisitos
### US-01 Resumir audio
serves: O-1 — es el flujo principal del objetivo
riesgo: alto — procesa audio con datos personales
- **AC-01.1** WHEN the user uploads audio THE SYSTEM SHALL show a summary
  serves: US-01 — criterio verificable de la historia
`;
const run = (files, phase, testIds, size) => check(parse(files.map(([path, text]) => ({ path, text }))), phase, testIds, size);

test('valid intake passes', () => {
  assert.deepEqual(run([['mission.md', mission], ['req.md', reqs]], 'intake'), []);
});

test('missing serves is orphan', () => {
  const out = run([['mission.md', mission.replace(' — serves: O-1 — mide la velocidad del resumen', '')], ['req.md', reqs]]);
  assert.ok(out.some((p) => p.includes('KR-1 orphan')));
  assert.ok(out.some((p) => p.includes('O-1 not covered: needs at least one KR')));
});

test('unknown ID, wrong kind and empty reason are rejected', () => {
  const bad = reqs.replace('serves: US-01 — criterio verificable de la historia', 'serves: QG-1 — x')
    + '- T001 serves: AC-09.9 — implementa algo que no existe\n';
  const out = run([['mission.md', mission], ['req.md', bad]]);
  assert.ok(out.some((p) => p.includes('AC-01.1 cannot serve QG-1')));
  assert.ok(out.some((p) => p.includes('AC-01.1 serves needs a reason')));
  assert.ok(out.some((p) => p.includes('T001 serves unknown ID AC-09.9')));
});

test('intake: every story needs riesgo alto|bajo with a reason; later phases do not re-check', () => {
  const missing = reqs.replace(/riesgo: alto.*\r?\n/, '');
  assert.ok(run([['mission.md', mission], ['req.md', missing]], 'intake').some((p) => p.includes('US-01 missing "riesgo:')));
  assert.ok(!run([['mission.md', mission], ['req.md', missing]], 'architect').some((p) => p.includes('riesgo')));
  const bad = reqs.replace('riesgo: alto — procesa audio con datos personales', 'riesgo: medio — x');
  assert.ok(run([['mission.md', mission], ['req.md', bad]], 'intake').some((p) => p.includes('US-01 missing "riesgo:')));
  const low = reqs.replace('riesgo: alto — procesa audio con datos personales', 'riesgo: bajo — solo cambia un texto en pantalla');
  assert.deepEqual(run([['mission.md', mission], ['req.md', low]], 'intake'), []);
});

test('duplicate definition is reported', () => {
  const out = run([['mission.md', mission], ['req.md', reqs], ['dup.md', '- O-1: otra vez\n']]);
  assert.ok(out.some((p) => p.includes('O-1 defined twice')));
});

test('later phases add coverage; No aplica waives it', () => {
  const files = [['mission.md', mission], ['req.md', reqs]];
  assert.ok(run(files, 'architect').some((p) => p.includes('QG-1 not covered')));
  const waived = mission.replace('sin fiabilidad no hay demo', 'sin fiabilidad no hay demo. No aplica: demo offline');
  assert.ok(!run([['mission.md', waived], ['req.md', reqs]], 'architect').some((p) => p.includes('QG-1 not covered')));
});

test('qa phase: every AC needs a test citing it; QS needs a test or report evidence', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sw-'));
  mkdirSync(join(dir, 'acceptance'));
  writeFileSync(join(dir, 'acceptance', 'resumen.test.ts'), "test('AC-01.1 shows summary', () => {})\n");
  writeFileSync(join(dir, 'test_x.py'), 'def test_AC_01_2_rejects(): pass\nQS_3\n');
  const ids = collectTestIds([dir]);
  assert.deepEqual([...ids].sort(), ['AC-01.1', 'AC-01.2', 'QS-3']);

  const qs = '- QS-1: p95 < 60 s — serves: QG-1 — demuestra la fiabilidad\n';
  const files = [['mission.md', mission], ['req.md', reqs], ['arch.md', qs]];
  const qa = (tested, extra = []) => run([...files, ...extra], 'qa', new Set(tested));
  assert.ok(qa([]).some((x) => x.includes('AC-01.1 untested')));
  assert.ok(qa([]).some((x) => x.includes('QS-1 no evidence')));
  assert.ok(!qa(['AC-01.1', 'QS-1']).some((x) => /untested|no evidence/.test(x)));
  const report = ['qa/report.md', '| QS-1 | k6 | evidencia: p95 = 40 s |\n'];
  assert.ok(!qa(['AC-01.1'], [report]).some((x) => x.includes('QS-1 no evidence')));
});

test('threats: TM needs a mitigating task at plan and evidence at qa; accepted risk waives it', () => {
  const tm = '- TM-1: login · suplantación · fuerza bruta\n';
  const t = '- T001 [US-01] serves: AC-01.1, TM-1 — limita intentos de login\n';
  const base = [['mission.md', mission], ['req.md', reqs]];
  assert.ok(run([...base, ['tm.md', tm]], 'plan').some((x) => x.includes('TM-1 not covered')));
  assert.ok(!run([...base, ['tm.md', tm], ['tasks.md', t]], 'plan').some((x) => x.includes('TM-1')));
  assert.ok(run([...base, ['tm.md', tm], ['tasks.md', t]], 'qa', new Set(['AC-01.1'])).some((x) => x.includes('TM-1 no evidence')));
  const sec = ['sec.md', '| TM-1 | mitigada | evidencia: test_login_lockout |\n'];
  assert.ok(!run([...base, ['tm.md', tm], ['tasks.md', t], sec], 'qa', new Set(['AC-01.1'])).some((x) => x.includes('TM-1')));
  const accepted = '- TM-1: login · fuerza bruta · Riesgo aceptado: demo sin usuarios reales\n';
  assert.ok(!run([...base, ['tm.md', accepted]], 'plan').some((x) => x.includes('TM-1')));
});

test('size S: no high-risk story, no architecture coverage, budget enforced unless waived', () => {
  const low = reqs.replace('riesgo: alto — procesa audio con datos personales', 'riesgo: bajo — solo cambia un texto en pantalla');
  const files = [['mission.md', mission], ['req.md', low]];
  assert.deepEqual(run(files, 'intake', null, 'S'), []);
  assert.ok(run([['mission.md', mission], ['req.md', reqs]], 'intake', null, 'S').some((p) => p.includes('US-01 is riesgo alto: size S')));
  assert.ok(!run(files, 'plan', null, 'S').some((p) => p.includes('QG-1 not covered')));
  assert.ok(run(files, 'plan', null, 'M').some((p) => p.includes('QG-1 not covered')));
  const adrs = '- ADR-1: a — serves: QS-1 — decide algo importante\n- ADR-2: b — serves: QS-1 — decide otra cosa\n- QS-1: x — serves: QG-1 — mide la fiabilidad\n';
  assert.ok(run([...files, ['adr.md', adrs]], 'intake', null, 'S').some((p) => p.includes('over budget for size S: 2 ADR (max 1)')));
  const waiver = ['mission.md', mission + '\nPresupuesto excedido: ADR — el cliente exige dos proveedores distintos\n'];
  assert.ok(!run([waiver, ['req.md', low], ['adr.md', adrs]], 'intake', null, 'S').some((p) => p.includes('ADR (max')));
  assert.ok(!run([...files, ['adr.md', adrs]], 'intake', null, 'L').some((p) => p.includes('over budget')));
});
