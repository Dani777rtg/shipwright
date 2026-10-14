---
name: build
description: Shipwright build — builds the approved spec with as many builders in parallel as there are independent tasks, tests first, reviews per batch, keeps the pace visible against the deadline, and continues straight into verify. Use when the user runs /shipwright:build or to resume an interrupted build.
disable-model-invocation: true
---

# Shipwright — BUILD

Principles: `${CLAUDE_PLUGIN_ROOT}/reference/engineering-principles.md`. Messages to the user in their language. Scripts run from the project root as `node "${CLAUDE_PLUGIN_ROOT}/scripts/<script>.mjs"`. Git: `${CLAUDE_PLUGIN_ROOT}/reference/git-workflow.md` (existing systems: the team's conventions win).

**Preconditions.** `state.mjs get` → `phase` is `build`, `<docsDir>/spec.md` is approved and `lock.mjs verify` passes (otherwise stop and report tampering). Done tasks are in `tasksDone`; resume from there.

## Loop — until every task is done
1. **Batch.** Every ready task (all `depends` done, not in `tasksDone`). `[P]` tasks run together, each in its own worktree (`isolation: "worktree"`); the rest one at a time.
2. **Build.** One `shipwright:builder` per task. Its prompt starts with `Sirves a <IDs>: <text of those criteria>`, then only: the task block, its criteria and threats, the acceptance test paths that cover them, the decision and design lines that apply, and the files to touch. Never the whole spec.
3. **Task gate (light).** The tests of the touched area and the acceptance tests of the task, the type checker, `lock.mjs verify`. A new dependency or a diff touching authentication, permissions or tenancy, input handling, queries, uploads, payments, secrets, personal data or LLM tools → `shipwright:security-lead` task **A** now, before merging. Merge the task (desde cero: squash into `main`; existing: commit on the mission branch — pushing is outward-facing, ask first) and `state.mjs add tasksDone <id>`.
4. **Batch review, in parallel, once the batch is merged:** `${CLAUDE_PLUGIN_ROOT}/vendor/ecc/agents/code-reviewer.md` plus the installed language reviewer in `.claude/agents/` if any (per `${CLAUDE_PLUGIN_ROOT}/reference/using-ecc.md`, on Sonnet), and `shipwright:qa-lead` task **B** on the batch's test diff. Then the full suite and the linter. Blocking findings go back to a builder (at most 3 rounds, then ask the user).
5. **Pace.** After each batch, one line: done/total, tasks per hour so far, estimated finish vs the deadline. If the estimate passes the deadline, stop and propose to the user which Could/Should stories to cut (through `/shipwright:change`) — now, not at the end.
6. **Deviation.** A builder reports that a task needs a different contract, dependency, decision, criterion or acceptance test → pause that task and propose `/shipwright:change`; other tasks continue.

## End
1. `shipwright:docs-lead` (product docs + quick start proven on a clean clone), in parallel with the built-in `/simplify` on the mission diff (it never touches locked tests). Re-run the full suite, lint, types and `lock.mjs verify`.
2. `metrics.mjs log build end`, `state.mjs set phase verify`, one line to the user, then read `${CLAUDE_PLUGIN_ROOT}/skills/verify/SKILL.md` and follow it. If the conversation is long, suggest `/compact` first — the session hook restores the mission.
