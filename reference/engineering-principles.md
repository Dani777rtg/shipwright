# Engineering principles — every Shipwright agent

Adapted from three MIT-licensed projects (see `THIRD_PARTY_NOTICES.md`): andrej-karpathy-skills (how to work), ponytail (how much to build), caveman (how agents report). Where they conflict with the Shipwright method, **the method wins**: the acceptance tests, the pertinent test types, the security baseline and the two human gates are never simplified away.

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

## 6. Language
Every message the user reads — questions, progress notes, gate summaries, the closing message of a phase — is written in the user's language (the language they write in; Spanish if they write Spanish), as are all deliverables. Only agent instructions and agent-to-agent reports may be in English. Never guess people's names from emails or usernames: ask, or use what they wrote.

## 7. Reports between agents (caveman style)
Subagent reports and orchestrator progress notes are terse: no pleasantries, no filler, no restating the task; fragments allowed; technical terms, paths, numbers, IDs and error strings exact; negations never dropped. Pattern: `[thing] [result] [reason]. [next].`

**Not** terse: questions to the user, gate summaries, explanations of decisions, and every persisted artifact (spec, verification report, docs, commits, PRs, handover) — those are written in clear, complete prose in the deliverable language.

## 8. Speed (the method's first goal after the quality floor)
- **Parallel by default.** Independent work runs at the same time: one QA agent per story, one builder per independent task in its own worktree, reviewers side by side. Waiting in series for something that does not depend on it is a defect.
- **Infer, don't ask.** Read the brief, the repository and its docs first; ask only what blocks, all in one batch. Everything else is an assumption with an owner and a date.
- **Minimal context.** Give each agent only what its task needs (its task block, criteria, tests, files), never whole documents.
- **Write only what someone will use.** One spec, one verification report. A document no one executes, reviews or reads before deciding is not written.
- **Light per task, full per batch.** Each task runs the tests of its area and the type checker; the full suite, linters and reviews run once per batch.
- **Pace is visible.** After each batch: done/total, rate, estimated finish vs the deadline; propose a cut as soon as the estimate passes it.
- **The quality floor is not negotiable for speed:** locked acceptance tests from EARS criteria by an independent agent, TDD, green suite/types/lint before integrating, security review of sensitive diffs and scans, human approval of the spec and of production.

## 9. Where mission artifacts go
`<docsDir>` is the `docsDir` value in `.shipwright/state.json` (`docs/` for a new project, `docs/shipwright/<mission>/` in an existing system). Process artifacts: `spec.md`, `review.md`, `verify.md`, `deploy.md` (only when deploying new infrastructure), `changes/`, `metrics.md`, `client/` — always under `<docsDir>`, never a hard-coded `docs/`. The delivered product's own documentation (README, configuration, API reference, guides) follows the repository's layout.

## 10. Models and sessions
- Default model per role: Opus for judgment (spec-reviewer, qa-lead, security-lead), Sonnet for building, documenting, deploying and batch code review (builder, docs-lead, devops-lead), Haiku for status. Users override with `CLAUDE_CODE_SUBAGENT_MODEL` (+ `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`).
- Phases chain without stopping except at the two human gates (spec, ship). Everything lives in files and the session-start hook restores the mission, so when a conversation grows long recommend `/compact` (only the user can run it).
