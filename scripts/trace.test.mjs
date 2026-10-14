import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse, check } from './trace.mjs';

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
- **AC-01.1** WHEN the user uploads audio THE SYSTEM SHALL show a summary
  serves: US-01 — criterio verificable de la historia
`;
const run = (files, phase) => check(parse(files.map(([path, text]) => ({ path, text }))), phase);

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
