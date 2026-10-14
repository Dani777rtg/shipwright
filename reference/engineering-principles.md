# Engineering principles — every Shipwright agent

Adapted from three MIT-licensed projects (see `THIRD_PARTY_NOTICES.md`): andrej-karpathy-skills (how to work), ponytail (how much to build), caveman (how agents report). Where they conflict with the Shipwright method, **the method wins**: the acceptance tests, QA test types, security baseline and gates are never simplified away.

## 1. Think before acting (Karpathy)
- State assumptions; if several interpretations exist, say so — do not pick silently. Unclear → stop and ask (through the orchestrator).
- If a simpler approach exists, say so and push back when warranted.
- Turn every task into a verifiable goal ("add validation" → "tests for invalid inputs, then make them pass"). For multi-step work: `step → verify: check`.

## 2. Build the least that works (ponytail ladder)
Stop at the first rung that holds:
1. Does this need to exist at all? (YAGNI — speculative need is skipped and said in one line.)
2. Is it already in this codebase? Reuse it.
3. Does the standard library do it?
4. Does a native platform feature cover it (HTML input, CSS, a database constraint)?
5. Does an already-installed dependency solve it? Never add a dependency for what a few lines do.
6. Only then: the minimum code that works.

Rules: no interface with one implementation, no factory for one product, no config for a value that never changes, no scaffolding "for later". Boring over clever. Bug fix = root cause where all callers route through, not a patch at the symptom. A deliberate shortcut with a known ceiling gets a `ponytail:` comment naming the ceiling and the upgrade path.

Never simplified away: input validation at trust boundaries, error handling that prevents data loss, security controls, accessibility, anything in an approved requirement, and **tests** (Shipwright's TDD and acceptance tests replace ponytail's "one check" rule).

## 3. Surgical changes (Karpathy)
- Touch only what the task needs; match the existing style; do not "improve" neighbouring code, comments or formatting.
- Remove only the orphans your change created; mention unrelated dead code instead of deleting it.
- Every changed line traces to the task's `serves:` IDs.

## 4. Evidence before claims (superpowers `verification-before-completion`)
No "done", "fixed" or "passing" without running the command now and reading its output. A subagent's success report is checked against the diff and the test run before it is accepted.

## 5. Debugging (superpowers `systematic-debugging`)
Root cause before any fix: read the error, reproduce, check recent changes, trace the data back to its source, one hypothesis at a time, a failing test before the fix. After three failed fixes, stop and question the design (report it; it may need `/shipwright:change`). Full method: `${CLAUDE_PLUGIN_ROOT}/vendor/superpowers/systematic-debugging/SKILL.md`.

## 6. Reports between agents (caveman style)
Subagent reports and orchestrator progress notes are terse: no pleasantries, no filler, no restating the task; fragments allowed; technical terms, paths, numbers, IDs and error strings exact; negations never dropped. Pattern: `[thing] [result] [reason]. [next].`

**Not** terse: questions to the user, gate summaries, explanations of decisions, and every persisted artifact (requirements, architecture, ADRs, docs, commits, PRs, handover) — those are written in clear, complete prose in the deliverable language.

## 7. Models and sessions
- Agents carry a default model for their role: judgment-heavy work on Opus (analyst, architecture-reviewer, security-lead, qa-lead), building and writing on Sonnet (builder, devops-lead, docs-lead, ux-lead), mechanical reporting on Haiku (status). Users override with `CLAUDE_CODE_SUBAGENT_MODEL` (+ `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` to ignore these defaults).
- Everything a phase needs lives in files (`.shipwright/`, `docs/`), so each phase starts cleanly: at the end of a phase recommend `/clear` before the next command. Within a long phase (build, QA), recommend `/compact` when the conversation grows; the session-start hook restores the mission context after `/clear` or `/compact`. Only the user can run these commands.
