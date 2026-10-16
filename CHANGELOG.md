# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: semver (see `docs/METHOD.md`).
Every entry that comes from a retro cites its origin project.

## [1.4.0] - 2026-10-16
### Changed
- **Feedback reaches GitHub, privately:** `feedback.mjs save` also opens an issue in `Dani777rtg/shipwright-feedback` (or `$SHIPWRIGHT_FEEDBACK_REPO`), only after gh confirms the repo is private; any gh failure keeps the local copy. `feedback.mjs inbox` lists open issues too.
- **Spec review only when it pays:** `spec-reviewer` runs when a story is `risk: high` or there are more than 4 stories.
- **Verify security pass only when it pays:** `security-lead` task B runs when a story is `risk: high` or the mission deploys; otherwise the build's sensitive-diff checks stand.
### Removed
- **Holdout tests** (`lock.mjs holdout`, `holdoutDir`): hiding a fifth of the acceptance tests from builders only moved failures to verify, where they cost a fix loop. Locked tests, the hook, fingerprints and the batch test-integrity review already stop builders from gaming tests. A mission started with a holdout folder: copy its tests into the acceptance path and run `lock.mjs record` before verify.
- `/simplify` at the end of build: every batch is already reviewed.
- `reference/companions.md`: no skill or agent read it.

## [1.3.0] - 2026-10-16
### Added
- **`/shipwright:feedback`:** at any phase, and on its own when ship closes, a mission console writes a short report (what was slow, over-engineered or broken, with the session-report numbers and the user's words) to the local inbox `~/.claude/shipwright/feedback/` through `scripts/feedback.mjs`. The Shipwright repo's `.claude/settings.json` lists pending reports at startup. Local only: reports can hold client details and the repo is public.
- **Fit check:** `/shipwright:spec` starts by asking whether the task needs Shipwright at all; bug fixes, few-line changes, spikes and questions are offered to be done directly with ECC.
- **README:** "When to use it" table — Shipwright versus ECC directly.

## [1.2.1] - 2026-10-16
Origin: feedback from a mission run on 0.13.1 (sistema-taller); only the points still open in 1.2.0.
### Changed
- **Build:** human steps (a person who reviews, approvals, credentials) are asked for at the start of the build, in parallel with the builders. A builder in a worktree starts with `git reset --hard <mission branch>`. The task gate compares the builder's `git show --stat HEAD` with the task's files.
- **Builder:** commit messages with repeated `-m`, never a heredoc (fails silently on Windows); the report includes `git show --stat HEAD`.
- **QA lead:** acceptance tests find UI elements by role and accessible name, never scan the whole DOM text, pin numbers or formats only when the spec states them, and are checked against the spec's decisions before reporting.
- **Change:** impact lists every locked test that cites an affected ID, not only new ones; a minor mode (one-line delta, one question, no subagents) for wording or non-behavioural test lines.
- **Spec:** `.gitattributes` with `* text=auto eol=lf` from scratch; every cost cap or quota says where its counter lives, whether a cold start resets it and the worst case at maximum scale; the approved `spec.md` joins `lockedPaths`, so `lock.mjs verify` also catches edits that bypass the hook.
### Fixed
- `trace.mjs`: only `spec.md` defines items; a heading like `# T056:` in an evidence file is no longer a second definition.

## [1.2.0] - 2026-10-14
### Changed
- **One goal:** a problem comes in, ECC's experts say how to solve it (architecture, development, QA), agents build it in parallel, brief checks, it ships. The spec phase now consults ECC explicitly — `architect` (plus `api-design` and `database-reviewer` when relevant), the stack skills, `tdd-workflow` and `e2e-testing`, `planner` — and records it in a new **Expert input** section.
- **Act, don't deliberate:** subagents are spawned at effort `low` (the spec-reviewer at `medium`); the thinking happens once, when the experts are consulted.
- **Brief checks:** the spec-reviewer reports blockers and majors only (at most 8); the security-lead runs on Sonnet with an 8-line report and looks only for what ECC's rules and the batch review miss. Verify no longer re-reviews the code (`/code-review`, `/security-review` and silent-failure-hunter removed there): it was already reviewed batch by batch.
- **English documentation:** README, method (`docs/METHOD.md`), stack catalog (`docs/stack-catalog.md`), research (`docs/research/`), lessons, benchmark guide, templates and changelog. Mission artifacts are still written in the user's language; `trace.mjs` accepts the keywords in English (`risk: high|low`, `Budget exceeded:`) and Spanish.
- Script output (`metrics.md` header, `session-report`) in English.

## [1.1.1] - 2026-10-14
### Changed
- **Minimal tools per agent.** builder, qa-lead, security-lead, docs-lead and devops-lead now declare `tools:`. Without that list they inherited every tool in the session (including the user's MCPs) and started with a ~50k-token base per turn, against 9–21k for the restricted agents; in the taller project it was 58 % of the builders' context.
- **One review per batch:** the language reviewer (or code-reviewer) with the test integrity check added. qa-lead no longer reviews diffs (it was 5 times more expensive per review than an ECC reviewer) and moves to Sonnet.
- Shipwright agents no longer launch nested ECC agents: they read its file and apply its method.
- Reports with a line cap and commands with summarized output: everything that reaches the orchestrator is re-read on every turn (~250k tokens per turn in the taller build).
- `install-packs.mjs` does not install ECC's process rules (`agents`, `development-workflow`, `git-workflow`, `code-review`): they were always loaded and contradict the method.
- New principle: an agent only for independence or parallelism; knowledge goes in as a skill.

### Added
- `session-report.mjs` also measures turns, context read and base per turn for each agent type.
- `docs/research/ecc-usage.md`: data-driven study of how ECC was used and where time and tokens went.

## [1.1.0] - 2026-10-14
### Added
- `scripts/session-report.mjs`: reads the project's Claude Code transcripts (read-only) and measures active and idle time, user messages, time per subagent type and builder time by tool family (tests, typecheck, installs, git). The retro uses it as evidence.

### Changed
- **ECC by role.** ECC is designed for the main thread to write code: of its 62 agents, about 33 only review, 12 fix build errors and few write; build knowledge lives in its 191 skills and 22 rule packs. Now each builder receives the stack skills (patterns and testing) that match its files; build, compile or type errors go to the installed language resolver instead of repeating the builder; database-reviewer reviews batches that change the schema and performance-optimizer handles high-risk performance tasks; qa-lead writes end-to-end tests for criteria that are only visible in the interface.

Origin: analysis of sistema-taller — the 26 builders read none of the installed ECC skills (backend patterns, Postgres, Prisma, React testing); in Build, ECC was only used as a reviewer.

## [1.0.1] - 2026-10-14
### Changed
- Builders run only the tests related to their change (the runner's related/changed mode) and their task's acceptance tests; the full suite runs once per batch.
- Before the first batch, each worktree gets isolated test resources (database or schema, port, temp folder) and dependencies are installed in fast mode.
- Ready tasks start without waiting for reviews of earlier tasks.

Origin: analysis of the sistema-taller transcripts. In Build, builders spent 29 % of their time running tests (182 runs, 58 of 199 minutes), often broad suites. In addition, 45 minutes were lost waiting for the user to launch the next phase and 31 minutes on a single agent writing 146 acceptance tests, two things 1.0 already solves by chaining phases and with one qa-lead per story.

## [1.0.0] - 2026-10-14
Rewrite aimed at speed without lowering the quality floor. Breaking: missions started with 0.x stay on the `v0.16.0` tag.

### Changed
- **4 phases and 2 human approvals:** `spec` (gathers mission, intake, architect and plan) → `build` → `verify` → `ship`, chained automatically. You approve the spec with the plan, and the delivery. `retro` becomes optional.
- **A single process document**, `spec.md`, plus `verify.md`. The delivered product is documented: README with a quick start tested on a clean clone, configuration, API.
- **Parallel by default:** one qa-lead per story writes the acceptance tests at the same time; builders in worktrees for all independent tasks; code review and test-diff review per batch, not per task; light per-task gate (area tests and types), full suite per batch.
- **Deduce before asking:** a single round of questions; everything else is assumptions with an owner and a date.
- **Minimal context** for each builder: its task, criteria, tests and files.
- **Visible pace:** after each batch, estimated time against the deadline and a cut proposal as soon as it will not be met.
- **ECC experts named per phase** (code explorer, planner, code, database and security reviewers, e2e, accessibility, silent failures, documentation, deployment); the stack packs are installed when the spec is approved, before the first commit.
- Simplified traceability: O → US → AC → T → test, plus TM only for high-risk stories; `serves:` only with IDs. Budget per story instead of S/M/L sizes.
- `bench.mjs` also penalizes process words.

### Removed
- Phases `mission`, `intake`, `architect`, `plan`, `qa` (now `spec` and `verify`); S/M/L sizes.
- Agents `analyst`, `architecture-reviewer` (now `spec-reviewer`) and `ux-lead` (ECC experts when there is an interface).
- Templates for arc42 architecture, ADR, threat model, test strategy and plan, requirements, glossary, existing system, tasks, UX, QA and security reports, deployment plan, runbook and handover (now `spec.md`, `verify.md` and `deploy.md`).
- QS scenarios, QG quality goals, KR, ADR and components as traced IDs.

### Added
- `scripts/refs.test.mjs`: every ECC tool and every Shipwright file that names skills and agents exists; an ECC sync that removes one breaks the CI.

Origin: first real use (sistema-taller): 7 h until construction started, 55,700 words of documents and 63 tasks for 4 features.

## [0.16.0] - 2026-10-14
### Added
- **Mission size S / M / L** (`docs/METHOD.md` §2), deduced in `/shipwright:mission` and confirmed by the user. It decides the path: S has no Architect phase, interviews only 5 sections, and has light QA, Ship and Retro; M applies rigor according to risk; L is the full method. A high-risk story raises an S mission to M; the size never goes down silently.
- **Budget per size** checked by `trace.mjs --size` (by default, the size in `state.json`): stories, criteria, tasks, ADRs, threats and QS. Exceeding it requires `Budget exceeded: <TYPE> — <reason>`, visible at the gate.
- **Benchmark:** mission 04 (small filter over the tasks API) that must come out S and within budget. `bench.mjs` scores the size's required artifacts and any exceeded budget; `compare` marks as worse a version that inflates the mission or changes its size, instead of rewarding more artifacts.
- The session context shows the size.

### Changed
- Principle 1: from "full method always" to "proportional method".
- What does not apply is recorded in one line, not item by item: the test strategy lists only the relevant types and the interview only the sections of the size.

Origin: first real use (sistema-taller). With an M budget, its architecture exceeds all 6 limits (16 stories, 83 criteria, 63 tasks, 14 ADRs, 36 threats, 14 QS).

 - 2026-10-14
### Added
- **ECC usage log.** `PostToolUse` hook (`scripts/hooks/ecc-used.mjs`): every ECC agent, skill or command read during a mission is recorded in `metrics.md` as an `ecc` event, once per phase. `metrics.mjs summary` lists it by phase and the retro uses it.
- **Deterministic stack packs.** `reference/stack-packs.json` maps stack keywords (with aliases) to ECC rules, skills and reviewers; `install-packs.mjs --stack <keywords> [--dry-run]` resolves them and always adds `rules/common`. The same stack always installs the same packs. A test checks that every path in the map exists in the manifest and on disk.
- **Search across the whole catalog.** `scripts/ecc-find.mjs <keywords> --phase <phase>` searches all 324 pieces; those for the current phase come first, but those for other phases are no longer hidden.

 - 2026-10-14
### Added
- **Rigor by risk** (`docs/METHOD.md` §3). Each story carries `risk: high|low — <reason>` (`riesgo: alto|bajo — <motivo>`): it is high if it touches money, personal data, permissions or isolation, an external integration, or bulk or irreversible operations on data. High-risk stories get their own QS, threats, ADRs and heavy tests; low-risk ones get EARS criteria with acceptance and unit tests. The user confirms the classification at the Intake gate.
- `trace.mjs --phase intake` rejects stories without `riesgo:`.
- analyst, security-lead, qa-lead and architecture-reviewer apply the rule; the reviewer flags heavy rigor on low-risk stories as over-engineering and stops reporting wording differences between documents that do not change what is built or tested.
- The Plan gate shows the estimate split by risk.

Origin: first real use (sistema-taller, October 2026 engagement). For 4 features in an existing system, the method produced 82 criteria, 14 ADRs, 36 threats and 63 tasks; file names and a toggle received the same rigor as credit and backup.

## [0.13.1] - 2026-10-14
### Fixed
Findings from the first real use (sistema-taller, October 2026 engagement).
- `/shipwright:mission` accepts client material files as the brief and copies them to `client/`.
- `/shipwright:mission` infers the mission card from the repo and only asks for confirmation.
- All messages to the user are in their language (the closing summary came out in English); the user's name is never guessed.
- Mission artifacts always go under `docsDir`, never to a fixed `docs/` path (the data inventory landed in `docs/security/`).
- Independent reviews are kept on disk: intake writes the analyst's and the qa-lead's testability review to `<docsDir>/spec/review.md`, and architect writes the architecture-reviewer's to `<docsDir>/architecture/review.md`, with the status of each finding. Reviewers run in the foreground and the gate is not presented without that file or with blocking findings open (the architecture review launched in the background was lost when the session closed).

## [0.13.0] - 2026-10-14
### Added
- `reference/engineering-principles.md`: principles for all agents, adapted from andrej-karpathy-skills (think before acting, surgical changes), ponytail (the minimum that works, without cutting tests or security), superpowers (evidence before claims, root-cause debugging) and caveman (short reports only between agents; questions and documents in clear prose).
- `vendor/superpowers/`: `systematic-debugging` and `verification-before-completion` (MIT), used by the builder and in the QA fix cycle.
- Model per role in each agent (Opus: analyst, architecture-reviewer, security-lead, qa-lead; Sonnet: builder, devops-lead, docs-lead, ux-lead; Haiku: status), overridable with environment variables.
- `SessionStart` hook (start, `/clear`, `/compact`, resume) that restores mission, phase and next command; each phase recommends `/clear` on closing and `/compact` if it runs long.
- Built-in Claude Code reviews: `/code-review` and `/security-review` in QA, `/simplify` at the end of Build.
- `reference/companions.md`: recommended optional companions.

## [0.12.0] - 2026-10-14
### Added
- `/shipwright:retro`: evidence (metrics, score, bugs, incidents, changes), analysis of which phase should have caught each escaped defect, guided retrospective, lessons turned into concrete diffs to the framework, applied with approval in a local clone of Shipwright with tests, evals, comparison against the benchmark and a new version; memory with graphify.
- Benchmark of 3 reference missions (`benchmarks/`): AI app from scratch, API with data and roles from scratch, and a change on an existing repo with tests.
- `scripts/bench.mjs`: scores a finished mission and compares two versions (exits with an error if anything gets worse).

## [0.11.0] - 2026-10-14
### Added
- `/shipwright:qa`: deployment to staging, verification of locked tests, incorporation of the hidden tests, all relevant test types, security report, documentation and interface verification, fix cycle with builders, `--phase qa` traceability and SHIP / NO SHIP verdict.
- `/shipwright:ship`: release preparation (version, CHANGELOG, SBOM, signing, runbook, documentation, handover document), production checklist, deployment only with approval, canary with immediate rollback; PR for existing systems; delivery of a report or PoC.
- `lock.mjs holdout`: moves the hidden tests into the locked path and records their fingerprint.
### Changed
- `devops-lead`: staging in QA (B1), preparation and production in Ship (B2).
### Fixed
- The `devops-lead` description had invalid YAML: the agent loaded without a description since v0.7.

## [0.10.0] - 2026-10-14
### Added
- `/shipwright:plan`: small traced tasks (including threat mitigations, infrastructure, documentation and interface), acceptance tests written by qa-lead, locked and fingerprinted, hidden (holdout) set outside the repo, test plan.
- `/shipwright:build`: one `builder` subagent per task (in parallel with isolated worktrees), code, test integrity, security and interface reviews before integrating; resumable; deviations stop and go through `change`.
- `/shipwright:change`: delta, impact analysis, approval and controlled opening of exactly the affected files (`scripts/change.mjs`).
- `scripts/state.mjs`: sole writer of `.shipwright/state.json`.
### Changed
- The hook always blocks `.shipwright/` (state and fingerprints), so nobody can remove the test lock by editing the state.
- The hook only acts in projects with an active mission (`.shipwright/state.json`); it never interferes with other repos.

## [0.9.0] - 2026-10-14
### Added
- `/shipwright:architect`: measurable quality scenarios confirmed with the user, stack and ADRs, `ARCHITECTURE.md` (arc42 + C4), and in parallel threat model, test strategy, deployment plan, documentation plan and clickable prototype. Gate with a prototype walkthrough; on approval it installs the stack packs.
- `architecture-reviewer` agent; `architecture.md` and `adr.md` templates (MADR with `serves:`).
- `scripts/install-packs.mjs`: installs into the project only the ECC rules, skills and agents for the chosen stack.
### Changed
- Accepted ADRs are protected like approved artifacts; an ADR can serve a threat (`TM-n`).

## [0.8.0] - 2026-10-14
### Added
- **Documentation of delivered repositories** with the `docs-lead` agent: Diátaxis standard by project type, documentation verified in QA (quick start on a clean machine, runnable examples, links, drift from the code), docs site only with external users, handover document.
- **UX/UI** with the `ux-lead` agent: key tasks, flows, states of each screen, clickable prototype approved by the user, design system, heuristic review.
- **Git flow** for delivered repos: short branches, Conventional Commits with `serves:`, PR template, semver, automatic CHANGELOG.
- `/shipwright:status`: one-screen report for whoever requested the work.
### Changed
- §5 of `METHOD.md` condensed into a table of five disciplines; the per-phase detail lives in each reference.

## [0.7.0] - 2026-10-14
### Added
- **Mandatory security** with an independent `security-lead` agent: data class and jurisdictions (Mission), EARS requirements and ASVS level (Intake), STRIDE + LLM/agent threat model (Architect), dependency verification against AI-invented packages (Build), ASVS report (QA), SBOM and signing (Ship). `reference/security-baseline.md` reference; threat model and security report templates.
- **Production on any platform** with the `devops-lead` agent: Azure, AWS, GCP, Render, Railway, Fly.io, Vercel, Netlify, Cloudflare, DigitalOcean, own server, Kubernetes, mobile stores. 14-point production checklist, deployment plan and runbook. No production deployment without user approval.
- Threat traceability (`TM-n`): mitigation in Plan, evidence in QA, "Accepted risk" as an explicit exception.
### Changed
- README and `METHOD.md` rewritten: shorter and more direct (METODO from ~460 to ~160 lines).
- The ECC index no longer lists pieces pending release.

## [0.6.0] - 2026-10-14
### Added
- Cross-cutting **QA** discipline with an independent `qa-lead` agent: testability in Intake, test strategy in Architect, acceptance tests from EARS in Plan, test-diff review in Build, full QA phase with SHIP / NO SHIP verdict, smoke and canary in Ship, escaped-bug analysis in Retro.
- `reference/qa-catalog.md`: more than 40 test types (functional, non-functional with load, stress, spike, soak and scalability, security, accessibility, AI) with a relevance rule, tools per stack and exit criterion; integrity, flaky, bug and release-exit policies.
- Templates: test strategy, closing report (ISO 29119-3), bug report.
- Locked acceptance tests: `lockedPaths` + hook that blocks editing and console writing + `scripts/lock.mjs` (SHA-256 fingerprints).
- `shipwright trace --phase qa`: every AC with a test that cites it, every QS with evidence.
### Changed
- The VERIFY phase is renamed **QA** (`/shipwright:qa`).

## [0.5.0] - 2026-10-13
### Added
- Installable Claude Code plugin (`.claude-plugin/plugin.json` + marketplace).
- `/shipwright:mission`: classification from scratch / on existing, confidentiality, tool check, mission card and explanation to the user.
- `/shipwright:intake`: analysis of the system and material with graphify, full interview checklist (15 sections), research of "I don't know" answers, traced objectives and EARS requirements, review by the `analyst` agent and gate.
- Templates: mission, requirements, existing system, glossary.
- `scripts/trace.mjs` (traceability per phase), `scripts/metrics.mjs` + phase-start hook, hook that protects approved artifacts.
- ECC v2.2.3 vendored: 324 pieces (16 pending release), index by phase, `reference/using-ecc.md`.
- `scripts/ecc-sync.mjs` + daily workflow with PR and AI review; CI with tests on Windows, macOS and Linux.

## [0.4.0] - 2026-10-13
### Changed
- **One method, always complete**: sizes, presets and cuts are removed. All phases, gates, questions and artifacts always; what does not apply is marked `Not applicable: <reason>`.
- The only distinction: from scratch / on existing.
- ECC: the whole development catalog, loaded on demand through a per-phase tool index (before: only 15–20 pieces).
- ECC sync: branch + AI review + pull request with human merge (before: automatic merge).
### Added
- Full interview checklist and "I don't know" answer with research and sources.
- `/shipwright:change` (changes as a delta) and `/shipwright:status`.
- Confidentiality question before analyzing existing code; deliverables language.
- Semantic review of `serves:` in addition to the script.
- Automatic metrics logging and a benchmark of reference missions to measure each version.
- Technical requirements (Node-only hooks; rules installation).

## [0.3.0] - 2026-10-13
### Changed
- The `hackathon`/`client` modes are replaced by **missions**: a single philosophy ("the best possible in the least time possible") with automatic depth by type (create / integrate), size and risk, and deliverable type. `hackathon` and `client` remain as presets.
- The SETUP phase becomes MISSION (`/shipwright:mission`), with explanation to the user and confirmation.
### Added
- Objective chain (mission → O → KR → QG → QS → ADR → component → story/AC → task → test) with mandatory `serves:` and rejection of orphan work (`shipwright trace`).
- Architecture goal defined as meeting the ordered quality goals through measurable scenarios.
- Mission card `docs/mission.md` and create/integrate examples.

## [0.2.0] - 2026-10-13
### Added
- ECC (affaan-m/ecc, MIT) as the base of agents and skills: piece-by-piece integration without editing (`vendor/ecc/`), automatic sync on every release with security checks and evals (`docs/METHOD.md` §10).
- Stack packs: only those for the stack chosen in ARCHITECT are installed in the project (§9).
- ECC analysis (`docs/research/ecc.md`) and `THIRD_PARTY_NOTICES.md`.
### Changed
- Roadmap reordered (§11).

## [0.1.0] - 2026-10-13
### Added
- Master method document (`docs/METHOD.md`): 8 phases, gates, hackathon/client modes, graphify usage, self-improvement loop, roadmap.
- Stack catalog (`docs/stack-catalog.md`).
- Base research: agent frameworks, spec-driven methodologies, graphify.
