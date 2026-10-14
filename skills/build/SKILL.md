---
name: build
description: Shipwright phase 5 — implement the planned tasks, one fresh builder subagent per task (parallel tasks in isolated worktrees), each reviewed for code, test integrity, security and UI before it is merged. Resumable. Use when the user runs /shipwright:build after an approved plan.
disable-model-invocation: true
---

# Shipwright — Phase 5: BUILD

**Language:** every message to the user (questions, progress, gate summary, closing message) and every artifact is in the user's language — Spanish if the user writes in Spanish. Instructions in this file are in English; your output is not.

Method: `${CLAUDE_PLUGIN_ROOT}/docs/METODO.md` §4–§5; git rules: `${CLAUDE_PLUGIN_ROOT}/reference/git-workflow.md` (existing systems: the team's conventions). State only through `node "${CLAUDE_PLUGIN_ROOT}/scripts/state.mjs" …` from the project root. You orchestrate; builders write the code.

## Preconditions
`state.mjs get` → `phase` must be `build`; `<docsDir>/plan/tasks.md` exists; `node "${CLAUDE_PLUGIN_ROOT}/scripts/lock.mjs" verify` passes (if not: stop, report tampering to the user). Done tasks are in `tasksDone`; the build resumes from there.

## Loop — until every task is done

1. **Ready tasks:** not in `tasksDone`, all `depends` done. Take the ready `[P]` tasks of the current group together (up to 4); otherwise one task.
2. **Build:** for each task spawn `shipwright:builder` (parallel tasks: `isolation: "worktree"`). Its prompt starts with `Sirves a <IDs>: <text of those IDs>`, then the task block, the relevant ARCHITECTURE.md sections and ADRs, the acceptance tests that cover it (paths), the project's test/lint/type commands and the branch name `<type>/<task-id>-<slug>`.
3. **Review**, in parallel, per finished task:
   - Code review: ECC `agents/code-reviewer.md` per `${CLAUDE_PLUGIN_ROOT}/reference/using-ecc.md` (plus the installed language reviewer from `.claude/agents/` if any).
   - `shipwright:qa-lead` task **D** on the test diff.
   - `shipwright:security-lead` task **C** when the builder reported a new dependency or the diff touches authentication, input handling, queries, uploads, payments, secrets or LLM tools.
   - `shipwright:ux-lead` task **C** when the diff touches the UI.
   Blocking findings go back to a builder for that task (max 3 rounds; then ask the user).
4. **Gate per task (automatic):** project tests, lint and types green; `lock.mjs verify` intact; `trace.mjs <docsDir> --phase plan` OK; docs updated. Then:
   - Desde cero: merge the task branch into `main` (squash, Conventional Commit message with `serves:`), `graphify update .`.
   - Sobre lo existente: commit on the mission branch per team conventions; pushing or opening a PR is outward-facing — ask the user first.
   - `state.mjs add tasksDone <task-id>`.
5. **Deviations:** a builder reports that the task needs a change to the architecture, a contract, an ADR, an approved requirement or an acceptance test → stop that task and propose `/shipwright:change` to the user. Never let a builder work around it.
6. **Progress:** after each group, a 3-line update (done/total, blockers, next).

## End
All tasks done → run the built-in `/simplify` on the mission diff (reuse, simplification, efficiency; it never touches locked tests) and re-run the checks; then full test suite, `lock.mjs verify`, `trace.mjs --phase plan`; `node "${CLAUDE_PLUGIN_ROOT}/scripts/metrics.mjs" log build end`; `state.mjs set phase qa`; tell the user the next step is `/shipwright:qa`.

## Session
Principles for every step: `${CLAUDE_PLUGIN_ROOT}/reference/engineering-principles.md` (subagent reports and progress notes terse; questions, gates and artifacts in clear prose). If this conversation grows long inside the phase, suggest `/compact`. When the phase closes, tell the user: run `/clear`, then `/shipwright:qa` — everything the next phase needs is in files, and the session-start hook restores the mission context.
