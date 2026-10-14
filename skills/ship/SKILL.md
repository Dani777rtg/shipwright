---
name: ship
description: Shipwright phase 7 — deliver to production on the user's platform (or open the PR / hand over the report for other deliverables). Prepares the release (version, changelog, SBOM, signing, runbook, final docs), checks production readiness, deploys only with the user's explicit approval, watches the canary, rolls back on failure and hands over. Use when the user runs /shipwright:ship after an approved QA.
disable-model-invocation: true
---

# Shipwright — Phase 7: SHIP

**Language:** every message to the user (questions, progress, gate summary, closing message) and every artifact is in the user's language — Spanish if the user writes in Spanish. Instructions in this file are in English; your output is not.

Method: `${CLAUDE_PLUGIN_ROOT}/docs/METODO.md` §4–§5; readiness checklist: `${CLAUDE_PLUGIN_ROOT}/reference/deploy-catalog.md`. State only through `node "${CLAUDE_PLUGIN_ROOT}/scripts/state.mjs" …`.

**Never deploy to production, change DNS, create paid resources, push to a shared remote or open a PR without the user's explicit approval in this session.**

## Preconditions
`state.mjs get` → `phase` is `ship` and `<docsDir>/qa/report.md` holds an approved release; otherwise stop.

## Steps

### Size S
Skip steps 1 and 2: no SBOM, signing, runbook or 14-point checklist unless the change needs them. Deliver through step 3 (usually the PR with a short impact note and how to revert), then step 4 without the readiness evidence.

### 1. Release preparation, in parallel
- `shipwright:devops-lead` task **B2-prep**: final IaC/config and CI/CD, health endpoints, alerts, runbook (`templates/runbook.md`), the exact production commands and their cost.
- `shipwright:security-lead` task **E**: SBOM, artifact signing/provenance, production secrets in a manager, hardening, `SECURITY.md` when public.
- `shipwright:docs-lead` tasks **B** and **D**: final README and docs, release notes, `<docsDir>/handover.md`.
- Version: next semver from the commits (Conventional Commits); CHANGELOG entry (release-please or generated from commits, then reviewed).

### 2. Readiness
Fill the 14-point checklist of `<docsDir>/ops/deploy-plan.md` with evidence so far. Any missing item that is not `No aplica` with an approved reason blocks the release; fix it or ask the user to accept the risk explicitly.

### 3. Deliver — by deliverable type
- **Deployed product:** show the plan (commands, platform, region, cost, rollback) → AskUserQuestion: Desplegar a producción / Esperar. On approval: tag `vX.Y.Z`, deploy, then smoke tests and canary watch for at least 15 minutes (ECC `skills/canary-watch`). If error rate or health regresses: roll back immediately, tell the user, file the bug, and return to the fix loop of `/shipwright:qa`.
- **Change to an existing system:** push the mission branch and open the PR with the template, impact note and rollback plan — after the user approves the push.
- **Report or PoC:** deliver the document or demo; record `No aplica: sin despliegue` for production items.

### 4. Close
- Complete the readiness evidence (alerts fired in test, traces visible, backups and restore verified, cost alerts).
- `graphify global add graphify-out/graph.json --as <mission-slug>` (adds the mission to the cross-project memory).
- Show the handover document and AskUserQuestion: Entrega aceptada (Recomendado) / Falta algo. Log `node "${CLAUDE_PLUGIN_ROOT}/scripts/metrics.mjs" log ship gate-approved|gate-changes "<note>"`.
- Accepted → `state.mjs set phase retro`; next step `/shipwright:retro`.

## Session
Principles for every step: `${CLAUDE_PLUGIN_ROOT}/reference/engineering-principles.md` (subagent reports and progress notes terse; questions, gates and artifacts in clear prose). If this conversation grows long inside the phase, suggest `/compact`. When the phase closes, tell the user: run `/clear`, then `/shipwright:retro` — everything the next phase needs is in files, and the session-start hook restores the mission context.
