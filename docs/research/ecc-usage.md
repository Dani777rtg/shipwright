# How Shipwright uses ECC, and where time and tokens were spent (2026-10-14)

Study of the first real mission (sistema-taller, Shipwright 0.13) to decide how to integrate ECC without waste. Sources: the vendored ECC v2.2.3 catalog (`vendor/ecc/`) and the mission's Claude Code transcripts, read unmodified with `scripts/session-report.mjs` and one-off analysis scripts.

**Method.** "Context read" = input tokens + cache read + cache write of each turn, counting each message once (Claude Code repeats usage on every block of the same response). "Base per turn" = context of an agent's first turn, before it reads anything: system prompt, tool definitions, always-loaded rules and memory. Cache tokens cost a fraction of the normal price, but context size does affect the latency of every turn and how full the window gets. Figures marked *estimate* are projections and will be verified with `session-report` on the next mission.

## 1. What ECC is built for

ECC assumes that **Claude's main thread writes the code** and calls specialists around it.

| Piece | How many | Purpose | How it is loaded |
|---|---|---|---|
| Agents | 62 | ~33 only review (read-only tools); 6 plan or explore; 12 fix build errors per language; ~11 write in their specialty (TDD, e2e, performance, accessibility, docs, refactor, generator/evaluator harness) | On demand; each with a restricted tool list |
| Skills | 191 | **How to build**: patterns, testing and guides per framework and stack | On demand (only the description is always visible) |
| Rules | 22 packs | Style, patterns, security and testing per language; plus process rules in `common/` | **Always loaded** unless they declare `paths:` |
| Commands | 48 | Procedures (`/tdd`, `/<language>-test`, `/build-fix`, `/feature-dev`, `/prp-implement`, `/gan-build`) | When invoked |

It has no general builder agent: building is the main thread's job, using the skills and rules.

## 2. Findings

### H1. Every Shipwright agent started with ~50k tokens of base per turn
| Agent | Tools | Base per turn |
|---|---|---|
| analyst, architecture-reviewer (Shipwright) | Read, Grep, Glob | 9k |
| caveman reviewer | Read, Grep, Bash | 17k |
| typescript-reviewer, react-reviewer (ECC) | Read, Grep, Glob, Bash | 20–21k |
| builder, qa-lead, security-lead, devops-lead, docs-lead, ux-lead (Shipwright) | **all** (did not declare `tools:`) | 42–50k |

Without `tools:`, an agent inherits all of the session's tools, including those from the user's MCPs (Gmail, Shopify, Docs, Chrome) and the one for launching agents. **For the builders, the base was 58% of all their context read** (50k × 759 turns ≈ 38M of 65.5M).
**Fix (v1.1.1):** each agent declares only the tools it uses. *Estimate:* the builder's base drops to ~25k, about 19M less for a mission like this.

### H2. ECC's process rules were loaded on every turn of every agent and contradict the method
`rules/common` includes `agents.md`, `development-workflow.md`, `git-workflow.md` and `code-review.md` (1,436 words, ~1.9k tokens). They order searching GitHub before coding, writing a PRD and architecture, launching `ecc:planner` and `ecc:tdd-guide` (which do not exist without the ECC plugin) and reviewing after every change. The workshop agents did not follow them (0 GitHub searches, 0 `ecc:` agents), but they paid for them on every turn: *estimate* ~3M tokens.
**Fix (v1.1.1):** `install-packs.mjs` no longer installs those four; the style, patterns, performance, security and testing rules are still installed.

### H3. The build skills were never used
Installed: backend-patterns, postgres-patterns, prisma-patterns, react-testing. **The 33 builders read 0 skills.** ECC only took part in Build as a reviewer.
**Fix (v1.1.0):** each builder receives the paths of the skills that touch its files and reads them before coding.

### H4. Reviewing per task with expensive agents
| Review | Runs | Context per run |
|---|---|---|
| ECC language reviewer | 7 | **0.11M** |
| security-lead per task | 9 | 0.41M |
| qa-lead reviewing the test diff per task | 16 | 0.59M |

The ECC reviewer is 4–5 times cheaper: restricted tools and a bounded task. Also, code-reviewer and the language reviewer overlap almost completely.
**Fix (v1.0 and v1.1.1):** a single review per batch, using the language reviewer (or code-reviewer if there is none) with the test integrity check added; qa-lead stops reviewing diffs; security only on sensitive diffs.

### H5. A single agent wrote all 146 acceptance tests
25.7M of context, 89 turns, 31 minutes: the context grows with every file written and is re-read in full on every turn.
**Fix (v1.0):** one qa-lead per story, in parallel. *Estimate:* a few minutes and a fraction of the context, because each agent sees only its story.

### H6. Builders spent half of their tool time on tests
188 test runs (54% of tool time), many of them broad suites taking over 2 minutes.
**Fix (v1.0.1):** related tests per task; full suite once per batch; test resources isolated per worktree.

### H7. The orchestrator is the biggest consumer per turn
The main thread read ~69M of context over 352 turns; in Build, **~250k tokens per turn** on average. Every subagent report and every command output stays in its context and is re-read on all following turns.
**Fix (v1.1.1):** length limits on reports (builder 8 lines, qa-lead 10, security-lead 15, reviewer 15 findings) and commands with output reduced to the summary and failures. **Pending:** measure the effect; if it is still high, move the per-task gate to a script that returns one line.

### H8. Phase waits and repeated reviews
~45 minutes waiting for the user to launch the next phase; two rounds of architecture review with corrections (24 minutes, 17M of context between reviewers and forks).
**Fix (v1.0):** chained phases and a single spec review.

## 3. Integration rules from the study

1. **An agent only for independence or parallelism.** Knowledge goes as a skill or rule to the agent that does the work.
2. **Minimal tools per agent**: every unused tool is paid for on every turn.
3. **ECC agents are the cheap reviewers**: one per batch, never two that overlap.
4. **Inside a Shipwright agent, ECC agents are not launched**: its file is read and its method applied.
5. **From ECC, install only what builds or reviews**, never its process.
6. **Everything that reaches the orchestrator is re-read on every turn**: capped reports and summarized logs.
7. **Measure, don't assume**: `session-report.mjs` in each mission's retro.

## 4. What is left to measure

The next mission with v1.1.1, measured with `session-report.mjs`, must confirm or correct the estimates for H1, H2, H5 and H7: builders' base per turn, orchestrator context per turn and time until building starts.
