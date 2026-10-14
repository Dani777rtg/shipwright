---
name: qa
description: Shipwright phase 6 — independent verification before shipping. Deploys to staging, checks locked tests, adds the hidden holdout tests, runs every pertinent test type, security verification, documentation and UI review, fixes bugs through builders, and issues a SHIP / NO SHIP verdict for the user. Use when the user runs /shipwright:qa after build.
disable-model-invocation: true
---

# Shipwright — Phase 6: QA

Method: `${CLAUDE_PLUGIN_ROOT}/docs/METODO.md` §4–§5; catalog and exit criteria: `${CLAUDE_PLUGIN_ROOT}/reference/qa-catalog.md`. State only through `node "${CLAUDE_PLUGIN_ROOT}/scripts/state.mjs" …` from the project root. The agents that verify are not the ones that built.

## Preconditions
`state.mjs get` → `phase` is `qa` and every task of `<docsDir>/plan/tasks.md` is in `tasksDone`; otherwise say what is missing and stop.

## Steps

### 1. Integrity
`node "${CLAUDE_PLUGIN_ROOT}/scripts/lock.mjs" verify`. Any change → file an S1 bug (`templates/bug-report.md`), show the user what changed and stop until they decide.

### 2. Staging
Spawn `shipwright:devops-lead` task **B1**: deploy to staging from the deploy plan, smoke test it, rehearse rollback, run a restore drill if there is a database. It must ask the user before creating paid resources. Deliverables without a deployment (report, PoC run locally): record `No aplica: <reason>` and test locally.

### 3. Holdout
`node "${CLAUDE_PLUGIN_ROOT}/scripts/lock.mjs" holdout <acceptance path>/holdout` (path from the test strategy). Then run the full acceptance suite.

### 4. Verification, in parallel
- `shipwright:qa-lead` task **E**: every pertinent test type of the strategy against staging (functional, regression, performance/load against the SLOs, accessibility, exploratory with a browser, AI evals…), bugs filed under `<docsDir>/qa/bugs/`, draft of `<docsDir>/qa/report.md`.
- `shipwright:security-lead` task **D**: `<docsDir>/security/report.md` (ASVS checklist, threats closed with evidence, SAST/SCA/secrets/DAST/headers, privacy tests, adversarial pass).
- `shipwright:docs-lead` task **C**: documentation verification (quick start on a clean machine, samples, links, drift).
- `shipwright:ux-lead` task **C** when there is a UI: built UI vs approved prototype, heuristics, accessibility.

Also run the built-in reviews on the mission's full diff: `/code-review high` (correctness) and, when the repository has an `origin` remote, `/security-review`. Their findings join the bug list.

### 5. Fix loop
For each S1/S2 bug, high/critical security finding and documentation failure: spawn `shipwright:builder` with the bug report and the instruction to follow `${CLAUDE_PLUGIN_ROOT}/vendor/superpowers/systematic-debugging/SKILL.md` (root cause before fix) (`Sirves a <AC/QS/TM>`), code changes only plus a regression test outside the locked paths; then re-run the affected checks. A bug that needs a requirement, architecture or acceptance-test change → `/shipwright:change`. S3/S4 bugs: fix or list in the report as known issues.

### 6. Traceability and report
- `node "${CLAUDE_PLUGIN_ROOT}/scripts/trace.mjs" <docsDir> --phase qa --tests <test dirs>`: every AC cited by a test, every QS and TM with evidence.
- Final `docs/qa/report.md` from `${CLAUDE_PLUGIN_ROOT}/templates/qa-report.md`, including the documentation and UX results; verdict **SHIP** only if every exit criterion holds.

### 7. Gate
Present the verdict, results per test type, open bugs, the security verdict and residual risks. AskUserQuestion: Aprobar release (Recomendado when SHIP) / Corregir lo pendiente / Aceptar riesgos residuales y aprobar (record who and why in the report). Log `node "${CLAUDE_PLUGIN_ROOT}/scripts/metrics.mjs" log qa gate-approved|gate-changes "<note>"`.
- Approved → `state.mjs set phase ship`; next step `/shipwright:ship`.

## Session
Principles for every step: `${CLAUDE_PLUGIN_ROOT}/reference/engineering-principles.md` (subagent reports and progress notes terse; questions, gates and artifacts in clear prose). If this conversation grows long inside the phase, suggest `/compact`. When the phase closes, tell the user: run `/clear`, then `/shipwright:ship` — everything the next phase needs is in files, and the session-start hook restores the mission context.
