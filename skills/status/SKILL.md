---
name: status
model: haiku
description: Shipwright mission status report for the person who requested the work — phase, progress, objectives coverage, risks, open decisions and next step. Read-only. Use when the user runs /shipwright:status or asks how the mission is going.
---

# Shipwright — Status

**Language:** every message to the user (questions, progress, gate summary, closing message) and every artifact is in the user's language — Spanish if the user writes in Spanish. Instructions in this file are in English; your output is not.

Read-only: never change mission artifacts here. Write in the mission's deliverable language. Keep it to one screen.

1. Read the state (`node "${CLAUDE_PLUGIN_ROOT}/scripts/state.mjs" get`). If missing, say there is no active mission and suggest `/shipwright:mission`.
2. Gather, from the project root:
   - `<docsDir>/mission.md`: mission, deadline, objectives (O) and metrics (KR).
   - `node "${CLAUDE_PLUGIN_ROOT}/scripts/metrics.mjs" summary`: hours and gate rounds per phase.
   - `node "${CLAUDE_PLUGIN_ROOT}/scripts/trace.mjs" <docsDir> --phase <current phase if intake|architect|plan|qa, else plan>`: traceability problems.
   - Open assumptions and open questions (mission.md, requirements.md).
   - Open bugs by severity (`<docsDir>/qa/bugs/`), open threats (`<docsDir>/security/threat-model.md`), tasks done (`tasksDone` in the state) / total (`<docsDir>/plan/tasks.md`), if they exist.
3. Report:
   ```
   Misión: <frase> — plazo <fecha> (<tiempo restante>)
   Fase: <fase> (<n>/8) — <estado>
   Avance: <tareas hechas/total o artefactos aprobados>
   Objetivos: <O-n: estado de su KR>
   Riesgos: <top 3: bugs S1/S2, amenazas abiertas, suposiciones sin confirmar, retraso>
   Decisiones pendientes del usuario: <lista>
   Siguiente paso: <comando>
   ```
4. Ask whether to save it as `<docsDir>/status/<YYYY-MM-DD>.md` (to share with the requester).
