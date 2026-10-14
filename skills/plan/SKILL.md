---
name: plan
description: Shipwright phase 4 — turn the approved architecture into small, traced tasks, and have the independent QA agent write the acceptance tests (locked and fingerprinted, with a hidden holdout set) and the test plan before any code exists. Use when the user runs /shipwright:plan after an approved architecture.
disable-model-invocation: true
---

# Shipwright — Phase 4: PLAN

**Language:** every message to the user (questions, progress, gate summary, closing message) and every artifact is in the user's language — Spanish if the user writes in Spanish. Instructions in this file are in English; your output is not.

Method: `${CLAUDE_PLUGIN_ROOT}/docs/METODO.md` §3–§5. State changes only through `node "${CLAUDE_PLUGIN_ROOT}/scripts/state.mjs" …` run from the project root.

## Preconditions
`state.mjs get` → `phase` must be `plan` and `ARCHITECTURE.md` must have `status: approved`; otherwise say which phase to run and stop. Read the mission card, requirements, ARCHITECTURE.md, ADRs, threat model, test strategy, deploy plan, documentation plan and UX spec.

## Steps

### 1. Tasks → `<docsDir>/plan/tasks.md`
From `${CLAUDE_PLUGIN_ROOT}/templates/tasks.md` (ECC `skills/blueprint` and `agents/planner.md` as method input, per `${CLAUDE_PLUGIN_ROOT}/reference/using-ecc.md`):
- Every task: `### T<NNN> [P?] [US-NN] <title>` + `serves: <AC/QS/TM> — <how>`, files, what it does, verification, complexity 1–10 (> 6 → split), `depends`.
- Group 1: walking skeleton (desde cero: repo structure, test runner, CI, empty deploy to staging) or safe preparation (sobre lo existente: feature flag, characterization tests).
- Then vertical slices per story by MoSCoW priority. Mark `[P]` only when tasks touch disjoint files and have no dependency between them.
- Include tasks for: every threat mitigation (`serves: TM-n`), infrastructure and CI from the deploy plan, documentation from the docs plan, UI screens and states from the UX spec.

### 2. Acceptance tests and test plan (independent QA)
- Holdout folder outside the repository: `~/.shipwright/holdout/<mission-slug>/` (create it).
- Spawn `shipwright:qa-lead` with task **C**, the paths of requirements, ARCHITECTURE.md, test strategy and tasks.md, the acceptance path from the test strategy (default `tests/acceptance/`) and the holdout folder.
- When it finishes, lock and fingerprint:
  ```
  node "${CLAUDE_PLUGIN_ROOT}/scripts/state.mjs" add lockedPaths "tests/acceptance/**"
  node "${CLAUDE_PLUGIN_ROOT}/scripts/state.mjs" set holdoutDir "<holdout folder>"
  node "${CLAUDE_PLUGIN_ROOT}/scripts/lock.mjs" record
  ```
  (use the acceptance path actually agreed). From here the builder cannot edit them.

### 3. Consistency
- `node "${CLAUDE_PLUGIN_ROOT}/scripts/trace.mjs" <docsDir> --phase plan` until OK (every AC, QS and TM has a task).
- Check yourself: dependencies are acyclic; every task has files and a verification; no complexity > 6; every acceptance test cites an AC that exists.

### 4. Gate
Present: number of tasks by group, the critical path and parallel groups, an estimate (sum of complexities and the critical path, split by high- and low-risk stories), acceptance tests written (visible / holdout), the test plan summary and risks. AskUserQuestion: Aprobar (Recomendado) / Pedir cambios / Volver a architect. Log `node "${CLAUDE_PLUGIN_ROOT}/scripts/metrics.mjs" log plan gate-approved|gate-changes|gate-back "<note>"`.
- Aprobar → `state.mjs set phase build`; next step `/shipwright:build`.
- Volver a architect → approved architecture changes only through `/shipwright:change`; explain and stop.

## Session
Principles for every step: `${CLAUDE_PLUGIN_ROOT}/reference/engineering-principles.md` (subagent reports and progress notes terse; questions, gates and artifacts in clear prose). If this conversation grows long inside the phase, suggest `/compact`. When the phase closes, tell the user: run `/clear`, then `/shipwright:build` — everything the next phase needs is in files, and the session-start hook restores the mission context.
