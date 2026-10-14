---
name: change
description: Shipwright change request — record a change to approved requirements, architecture, threat model, acceptance tests or plan as a delta, analyze its impact, get the user's approval, then open exactly the affected files, apply it and re-verify traceability. Use when the user runs /shipwright:change or when a phase reports a needed deviation.
argument-hint: "\"<what changes and why>\""
disable-model-invocation: true
---

# Shipwright — Change

Request: $ARGUMENTS

State only through `node "${CLAUDE_PLUGIN_ROOT}/scripts/state.mjs" …` from the project root. Ask through AskUserQuestion.

1. **Delta.** If the request is empty, ask for it. Write `<docsDir>/changes/<NNN>-<slug>.md` from `${CLAUDE_PLUGIN_ROOT}/templates/change.md` (NNN = next number): motive; ADDED / MODIFIED / REMOVED per artifact with the affected IDs.
2. **Impact.** Affected IDs downstream (`trace.mjs`), code impact (`graphify affected "<component>" --depth 2` when there is code), tasks to redo, schedule, cost and new risks. Spawn in parallel when relevant: `shipwright:security-lead` (new trust boundary, dependency or data class → threat model update), `shipwright:qa-lead` (acceptance tests or strategy affected), `shipwright:architecture-reviewer` (architecture or ADRs affected). List the exact files that must be edited.
3. **Gate.** Present the delta and impact. AskUserQuestion: Aprobar (Recomendado) / Ajustar / Rechazar. Rejected → mark the delta `rechazado` and stop.
4. **Apply** (only after approval):
   - `node "${CLAUDE_PLUGIN_ROOT}/scripts/change.mjs" open <NNN> <file>...` (exactly the files listed).
   - Edit those files; new ADRs supersede old ones (`Estado: reemplazada por ADR-m`), never silently rewrite history. Acceptance-test changes are written by `shipwright:qa-lead`.
   - `node "${CLAUDE_PLUGIN_ROOT}/scripts/trace.mjs" <docsDir> --phase <current phase if intake|architect|plan|qa, else plan>` until OK.
   - `node "${CLAUDE_PLUGIN_ROOT}/scripts/change.mjs" close` (re-fingerprints locked tests).
   - Mark the delta `aplicado`; add affected tasks back to the plan (remove them from `tasksDone` with `state.mjs set tasksDone '<json array>'` when they must be redone).
5. Tell the user what changed and which phase continues.
