---
name: build
description: Shipwright build — builds the approved spec with as many builders in parallel as there are independent tasks, tests first, reviews per batch, keeps the pace visible against the deadline, and continues straight into verify. Use when the user runs /shipwright:build or to resume an interrupted build.
disable-model-invocation: true
---

# Shipwright — BUILD

Principles: `${CLAUDE_PLUGIN_ROOT}/reference/engineering-principles.md` — act, don't deliberate. Messages to the user in their language. Scripts run from the project root as `node "${CLAUDE_PLUGIN_ROOT}/scripts/<script>.mjs"`. Git: `${CLAUDE_PLUGIN_ROOT}/reference/git-workflow.md` (existing systems: the team's conventions win).

**Preconditions.** `state.mjs get` → `phase` is `build`, `<docsDir>/spec.md` is approved and `lock.mjs verify` passes (otherwise stop and report tampering). Done tasks are in `tasksDone`; resume from there.

**Human steps first.** Find in the tasks every step that needs a person (a named person who listens, reviews or signs; an approval; a credential, account or file only the user has) and ask for all of them now, in one message, while the builders start. Never discover them when a task reaches them.

## ECC packs by role
The packs installed at the spec gate are in `state.mjs get packs` and under `.claude/`. Use them by role, by name:
- `skills/*` (patterns, testing, framework) → **construction knowledge**: give each builder the paths of the `.claude/skills/<name>/SKILL.md` that match its task's files (e.g. React component → `react-patterns`, `react-testing`; SQL → `postgres-patterns`).
- `agents/*-build-resolver.md` → **fixer**: when a task's gate fails on build, compile or type errors (not on test logic), spawn the installed resolver for that language on the error output instead of looping the builder.
- `agents/*-reviewer.md` → **the batch reviewer** (step 4): one per batch, never two that overlap.
- `rules/*` → always on; builders follow them without being told.

## Before the first batch — parallel isolation
Parallel builders must not share mutable test resources. If the project's tests use a database, ports or files, make sure (in the first task, or now if the harness exists) that each worktree gets its own: a database or schema name from an environment variable, its own port, its own temp dir. Pass each builder its values. Install dependencies the fast way (offline, frozen lockfile, shared package store).

## Loop — until every task is done
1. **Batch.** Every ready task (all `depends` done, not in `tasksDone`) starts now, each `[P]` task in its own worktree (`isolation: "worktree"`); the rest one at a time. Do not hold ready tasks back to wait for reviews of earlier ones.
2. **Build.** One `shipwright:builder` per task, effort `low`. Its prompt starts with `Serves <IDs>: <text of those criteria>`, then only: the task block, its criteria and threats, the acceptance test paths that cover them, the decision and design lines that apply, the files to touch, its isolated test resources and the stack skill paths for its files. Never the whole spec. A builder in a worktree gets as its first instruction `git reset --hard <mission branch>` (`main` from scratch): worktrees can start from an older commit.
3. **Task gate (light).** Compare the builder's `git show --stat HEAD` with the task's files; a missing commit or file means the task is not done. Related tests and the task's acceptance tests, the type checker, `lock.mjs verify` — the full suite never runs per task. A new dependency or a diff touching authentication, permissions or tenancy, input handling, queries, uploads, payments, secrets, personal data or LLM tools → `shipwright:security-lead` task **A** (effort `low`, a short check) now, before merging. Merge the task (desde cero: squash into `main`; existing: commit on the mission branch — pushing is outward-facing, ask first) and `state.mjs add tasksDone <id>`.
4. **Batch review — one reviewer, once the batch is merged:** the installed language reviewer in `.claude/agents/` (e.g. `typescript-reviewer`), or `${CLAUDE_PLUGIN_ROOT}/vendor/ecc/agents/code-reviewer.md` when there is none, run per `${CLAUDE_PLUGIN_ROOT}/reference/using-ecc.md` on the batch diff, effort `low`. Append to its task the test-integrity check: reject deleted or weakened assertions, `skip`/`only`/`xfail`/`@Disabled`, changed expected values, lowered thresholds, narrowed test data, mocks of the system under test or swallowed exceptions in the batch's tests. At most 15 findings. In parallel, the full suite and the linter. Blocking findings go back to a builder (at most 3 rounds, then ask the user). Run every command with output reduced to the summary and failures (dot or summary reporter, `| tail`): full logs never enter this conversation. A batch that changes the database schema also gets `${CLAUDE_PLUGIN_ROOT}/vendor/ecc/agents/database-reviewer.md`; a task serving a high-risk performance criterion, `${CLAUDE_PLUGIN_ROOT}/vendor/ecc/agents/performance-optimizer.md` on its diff.
5. **Pace.** After each batch, one line: done/total, tasks per hour so far, estimated finish vs the deadline. If the estimate passes the deadline, stop and propose to the user which Could/Should stories to cut (through `/shipwright:change`) — now, not at the end.
6. **Deviation.** A builder reports that a task needs a different contract, dependency, decision, criterion or acceptance test → pause that task and propose `/shipwright:change`; other tasks continue.

## End
1. `shipwright:docs-lead` (effort `low`; product docs + quick start proven on a clean clone). Re-run the full suite, lint, types and `lock.mjs verify`.
2. `metrics.mjs log build end`, `state.mjs set phase verify`, one line to the user, then read `${CLAUDE_PLUGIN_ROOT}/skills/verify/SKILL.md` and follow it. If the conversation is long, suggest `/compact` first — the session hook restores the mission.
