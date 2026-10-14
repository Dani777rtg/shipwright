---
name: status
model: haiku
description: Shipwright mission status for the person who requested the work — phase, progress and pace against the deadline, risks, pending decisions and next step. Read-only. Use when the user runs /shipwright:status or asks how the mission is going.
---

# Shipwright — STATUS

Read-only. One screen, in the user's language (translate the labels).

1. `node "${CLAUDE_PLUGIN_ROOT}/scripts/state.mjs" get`. Missing → no active mission; suggest `/shipwright:spec`.
2. Gather: `<docsDir>/spec.md` (mission, deadline, objectives, assumptions), `metrics.mjs summary`, `tasksDone` vs the tasks in spec.md, `<docsDir>/verify.md` if present (verdict, open bugs), `trace.mjs <docsDir>`.
3. Report:
   ```
   Mission: <sentence> — deadline <date> (<time left>)
   Phase: <spec | build | verify | ship | done> (<n>/4)
   Progress: <tasks done/total> — pace <tasks/hour> — estimated finish <date/time> (<on time | late by X>)
   Objectives: <O-n: status>
   Risks: <top 3: S1/S2 bugs, open threats, unconfirmed assumptions, delay>
   Pending decisions: <list>
   Next step: <command>
   ```
