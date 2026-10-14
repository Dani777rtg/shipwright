---
name: status
model: haiku
description: Shipwright mission status for the person who requested the work — phase, progress and pace against the deadline, risks, pending decisions and next step. Read-only. Use when the user runs /shipwright:status or asks how the mission is going.
---

# Shipwright — STATUS

Read-only. One screen, in the user's language.

1. `node "${CLAUDE_PLUGIN_ROOT}/scripts/state.mjs" get`. Missing → no active mission; suggest `/shipwright:spec`.
2. Gather: `<docsDir>/spec.md` (mission, deadline, objectives, assumptions), `metrics.mjs summary` (hours per phase), `tasksDone` vs the tasks in spec.md, `<docsDir>/verify.md` if present (verdict, open bugs), `trace.mjs <docsDir>`.
3. Report:
   ```
   Misión: <frase> — plazo <fecha> (quedan <tiempo>)
   Fase: <spec | build | verify | ship | done> (<n>/4)
   Avance: <tareas hechas/total> — ritmo <tareas/hora> — fin estimado <fecha/hora> (<a tiempo | tarde por X>)
   Objetivos: <O-n: estado>
   Riesgos: <top 3: bugs S1/S2, amenazas abiertas, supuestos sin confirmar, retraso>
   Decisiones pendientes: <lista>
   Siguiente paso: <comando>
   ```
