---
name: build
description: Shipwright build — builds the approved spec with as many builders in parallel as there are independent tasks, tests first, reviews per batch, keeps the pace visible against the deadline, and continues straight into verify. Use when the user runs /shipwright:build or to resume an interrupted build.
disable-model-invocation: true
---

# Shipwright — BUILD

Principles: `${CLAUDE_PLUGIN_ROOT}/reference/engineering-principles.md`. Messages to the user in their language. Scripts run from the project root as `node "${CLAUDE_PLUGIN_ROOT}/scripts/<script>.mjs"`. Git: `${CLAUDE_PLUGIN_ROOT}/reference/git-workflow.md` (existing systems: the team's conventions win).

**Preconditions.** `state.mjs get` → `phase` is `build`, `<docsDir>/spec.md` is approved and `lock.mjs verify` passes (otherwise stop and report tampering). Done tasks are in `tasksDone`; resume from there.

## ECC packs by role
The packs installed at the spec gate are in `state.mjs get packs` and under `.claude/`. Use them by role, by name:
- `skills/*` (patterns, testing, framework) → **construction knowledge**: give each builder the paths of the `.claude/skills/<name>/SKILL.md` that match its task's files (e.g. React component → `react-patterns`, `react-testing`; SQL → `postgres-patterns`).
- `agents/*-build-resolver.md` → **fixer**: when a task's gate fails on build, compile or type errors (not on test logic), spawn the installed resolver for that language on the error output instead of looping the builder.
- `agents/*-reviewer.md` → **batch reviewer** (step 4).
- `rules/*` → always on; builders follow them without being told.

## Before the first batch — parallel isolation
Parallel builders must not share mutable test resources. If the project's tests use a database, ports or files, make sure (in the first task, or now if the harness exists) that each worktree gets its own: a database or schema name from an environment variable, its own port, its own temp dir. Pass each builder its values. Install dependencies the fast way (offline, frozen lockfile, shared package store).

## Loop — until every task is done
1. **Batch.** Every ready task (all `depends` done, not in `tasksDone`) starts now, each `[P]` task in its own worktree (`isolation: "worktree"`); the rest one at a time. Do not hold ready tasks back to wait for reviews of earlier ones.
2. **Build.** One `shipwright:builder` per task. Its prompt starts with `Sirves a <IDs>: <text of those criteria>`, then only: the task block, its criteria and threats, the acceptance test paths that cover them, the decision and design lines that apply, the files to touch, its isolated test resources and the stack skill paths for its files. Never the whole spec.
3. **Task gate (light).** Related tests and the task's acceptance tests, the type checker, `lock.mjs verify` — the full suite never runs per task. A new dependency or a diff touching authentication, permissions or tenancy, input handling, queries, uploads, payments, secrets, personal data or LLM tools → `shipwright:security-lead` task **A** now, before merging. Merge the task (desde cero: squash into `main`; existing: commit on the mission branch — pushing is outward-facing, ask first) and `state.mjs add tasksDone <id>`.
4. **Batch review, in parallel, once the batch is merged:** `${CLAUDE_PLUGIN_ROOT}/vendor/ecc/agents/code-reviewer.md` plus the installed language reviewer in `.claude/agents/` if any (per `${CLAUDE_PLUGIN_ROOT}/reference/using-ecc.md`, on Sonnet), and `shipwright:qa-lead` task **B** on the batch's test diff. Then the full suite and the linter. Blocking findings go back to a builder (at most 3 rounds, then ask the user). A batch that changes the database schema also gets `${CLAUDE_PLUGIN_ROOT}/vendor/ecc/agents/database-reviewer.md`; a task serving a high-risk performance criterion, `${CLAUDE_PLUGIN_ROOT}/vendor/ecc/agents/performance-optimizer.md` on its diff.
5. **Pace.** After each batch, one line: done/total, tasks per hour so far, estimated finish vs the deadline. If the estimate passes the deadline, stop and propose to the user which Could/Should stories to cut (through `/shipwright:change`) — now, not at the end.
6. **Deviation.** A builder reports that a task needs a different contract, dependency, decision, criterion or acceptance test → pause that task and propose `/shipwright:change`; other tasks continue.

## End
1. `shipwright:docs-lead` (product docs + quick start proven on a clean clone), in parallel with the built-in `/simplify` on the mission diff (it never touches locked tests). Re-run the full suite, lint, types and `lock.mjs verify`.
2. `metrics.mjs log build end`, `state.mjs set phase verify`, one line to the user, then read `${CLAUDE_PLUGIN_ROOT}/skills/verify/SKILL.md` and follow it. If the conversation is long, suggest `/compact` first — the session hook restores the mission.
