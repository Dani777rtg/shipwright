# QA catalog — test types, pertinence rules, tools, exit criteria

Used by the `qa-lead` agent to build the Test Strategy (Architect) and the Test Plan (Plan), and to run the QA phase.
Framework: ISTQB CTFL 4.0 (levels and types), ISO/IEC 25010:2023 (quality characteristics), ISO/IEC/IEEE 29119-3 (strategy, plan, completion report), risk-based testing (likelihood × impact). Shape: test pyramid for backends, testing trophy (more integration) for frontends.

**Rule:** every type below is evaluated for every mission. If its pertinence rule matches, it is mandatory and listed in the Test Strategy. The types that do not apply are recorded together in one line (`No aplica: <tipos> — <motivo>`), not one row each. Tools are defaults verified on 2026-10-14; the mission's stack and existing tooling win (for an existing system, reuse its tools first). Numeric thresholds marked *(guide)* are starting points, not standards: the Test Strategy states the mission's own values.

Stacks: JS = JavaScript/TypeScript · Py = Python · JVM = Java/Kotlin · Go · NET = .NET · Mob = mobile.

## Functional

| Type | Pertinent when | Tools | Exit criterion |
|---|---|---|---|
| Unit | Always | JS Vitest / Jest · Py pytest + pytest-cov · JVM JUnit 6, Kotest · Go `testing` · NET xUnit v3 | 100% green; branch coverage ≥ 80% on new code *(guide)* |
| Component (UI) | Has UI | Testing Library, Vitest browser mode, MSW · Flutter widget tests | Green; assertions by accessible role |
| Integration | Has a database, queue or external service | Testcontainers (all major stacks) | Green against real dependencies, no mocked database |
| Contract | API consumed by another team/service, or microservices | Pact (JS/JVM/Py/NET) · Schemathesis (OpenAPI/GraphQL) | can-i-deploy green; 0 schema violations |
| API | Has an HTTP/GraphQL API | Supertest · httpx + pytest · REST Assured · Schemathesis | Every endpoint: happy path, error path, 401/403 |
| Acceptance (ATDD) | Always — one or more tests per EARS criterion | Plain tests named with the AC ID; optional Gherkin (cucumber-js, pytest-bdd, Cucumber-JVM, Reqnroll) | 100% of AC traced and green; locked files intact |
| E2E / UI | Has UI | Playwright · Mob: Maestro, Appium, Detox, Espresso/XCUITest | Critical journeys green in CI; 0 flaky at the gate |
| Visual regression | UI where layout/brand matters | Playwright `toHaveScreenshot` · Flutter goldens (not BackstopJS: abandoned) | 0 unapproved diffs; no baseline = inconclusive |
| Regression suite | Always | Stack runner | 100% green; every fixed bug has a test |
| Smoke / sanity | There is a build or deployment | Playwright, k6 with 1 VU, health-check requests | Starts, health 200, no console errors |
| Exploratory (AI) | Has UI or a user-facing API | Playwright MCP, Claude in Chrome, browser-use, Stagehand; ECC `skills/browser-qa`, `agents/gan-evaluator.md` | Every charter covered within its timebox; findings filed as bugs |
| Property-based | Parsers, money, dates, algorithms, state machines | fast-check · Hypothesis · jqwik, Kotest-property · FsCheck · rapid (Go) | No counterexample in ≥ 1000 cases *(guide)* |
| Fuzzing | Parses untrusted input or uses native code | `go test -fuzz` · Jazzer · Atheris · cargo-fuzz · SharpFuzz | 0 crashes within a fixed time budget |
| Mutation | Core logic — always when code is written by AI agents | StrykerJS · Stryker.NET · PIT · mutmut · Gremlins (Go, immature) | Mutation score ≥ 70% on new core code *(guide)*; never decreases |

## Non-functional

| Type | Pertinent when | Tools | Exit criterion |
|---|---|---|---|
| Load | Networked service with an SLO or > ~50 concurrent users *(guide)* | k6 · Gatling · Locust · NBomber · JMeter | p95/p99 within SLO at expected load; error rate < 1% |
| Stress | Same as load | Same | Breaking point documented; degrades gracefully and recovers |
| Spike | Traffic bursts expected (events, campaigns, demo day) | Same | No errors beyond threshold during the spike; recovery time stated |
| Soak / endurance | Long-running service | Same, hours of sustained load | No memory/connection growth; latency stable |
| Scalability | Horizontal scaling is a requirement | Same + infrastructure metrics | Throughput grows with instances as stated |
| Web performance | Public web UI | Lighthouse / LHCI | LCP < 2.5 s, INP < 200 ms, CLS < 0.1 (p75) |
| SAST | Always | Semgrep · CodeQL · Bandit · gosec | 0 untriaged high/critical |
| Dependencies (SCA) | Always | OSV-Scanner · Trivy · Grype · npm audit · pip-audit | 0 exploitable critical/high CVEs; SBOM generated |
| Secrets | Always | Gitleaks | 0 secrets in repo and history |
| DAST | Exposes HTTP | OWASP ZAP baseline / API scan | 0 High; Medium triaged |
| Authentication / authorization | Has users or roles | API tests over a role × resource matrix; OWASP ASVS 5.0 | Full matrix green; ASVS L1 always, L2 with PII or payments, L3 for critical systems |
| Accessibility | Has UI | axe-core (@axe-core/playwright), pa11y + manual keyboard and screen-reader pass (axe covers ~30–40% of WCAG) | 0 serious/critical axe violations + manual WCAG 2.2 AA checklist |
| Usability | UI for end users | Heuristic review (Nielsen) by agent; tasks with real users when available | Key tasks completable; no severity-4 issues |
| Compatibility | Web or mobile UI | Playwright projects (Chromium, Firefox, WebKit); device farm or emulators | Supported matrix green |
| i18n / l10n | More than one language or market | Pseudo-localization, i18next / Lingui checks | 0 missing keys; no truncation; RTL if required |
| Data / migration | Persistent database | Flyway · Liquibase · Alembic · Prisma migrate + Testcontainers | Up and down migration on a production-like copy; counts and checksums match |
| Resilience / chaos / failover | Distributed service or availability SLO | Toxiproxy · Chaos Mesh · LitmusChaos | Degrades gracefully; RTO/RPO met |
| Installation / deployment / rollback | There is a deployable artifact | Staging pipeline + health checks; signed artifacts (cosign) | Deploy and rollback rehearsed; version verifiable |
| Observability | Runs in production | OpenTelemetry assertions in tests; alert firing test | Each critical error produces log + trace; alerts fire |
| Compliance / privacy | Handles PII, health or payment data | Deletion/export tests, PII-in-logs scan, framework checklist (GDPR, HIPAA, PCI, local law) | Regulatory requirements traced and green |

## AI / LLM applications

| Type | Pertinent when | Tools | Exit criterion |
|---|---|---|---|
| LLM evals | The product calls an LLM | promptfoo · DeepEval · Inspect AI; golden set + code/model graders; ECC `skills/eval-harness` | Golden-set score ≥ threshold; no regression vs baseline |
| RAG quality | Retrieval-augmented generation | Ragas, DeepEval (faithfulness, context precision/recall); ECC `agents/rag-pipeline-reviewer.md` | Faithfulness ≥ 0.8 *(guide)*; recall/precision ≥ stated targets |
| Hallucination | LLM answers factual questions | DeepEval / Ragas hallucination or faithfulness metrics | Rate below threshold on the golden set |
| Prompt injection / red team | LLM receives untrusted input or has tools | garak · PyRIT · promptfoo red-team; OWASP LLM Top 10 2025 | 0 system-prompt or data leaks; attack success below threshold |
| Cost / latency budget | LLM in production or in a live demo | Langfuse / Phoenix traces; promptfoo cost assertions | p95 latency and cost per request within budget |
| Agent trajectory | The product is an agent with tools | Inspect AI, DeepEval tool correctness, custom graders; pass@k / pass^k | Outcome graded; pass^k ≥ target on user-facing flows |

## Policies

**Test integrity (AI agents must not weaken tests)**
1. The QA agent writes acceptance tests from the EARS criteria during Plan. Their paths go in `lockedPaths` (`.shipwright/state.json`); the hook blocks edits and `node scripts/lock.mjs record` stores their hashes.
2. Holdout: a subset of acceptance tests is kept outside the repository (`~/.shipwright/holdout/<mission>/`) until the QA phase, so the builder cannot tailor code to them.
3. Builder prompts state: the specification and the acceptance tests are the source of truth; never modify, skip or delete a test to make it pass.
4. Every task's test diff is reviewed by qa-lead: no deleted assertions, no `skip`/`only`/`xfail`, no changed expected values without a justification.
5. Coverage and mutation score never decrease.
6. QA phase starts with `node scripts/lock.mjs verify`; any tampering is a blocker.

**Flaky tests**: fails then passes on retry = flaky. Quarantine outside the gate but keep running and reporting it; owner and deadline (7 days *(guide)*), then fix, rewrite or delete. Zero flaky tests in the acceptance suite. Retries only for E2E, at most 2.

**Bugs**: format in `templates/bug-report.md`. Severity (technical impact): S1 critical (crash, data loss, security, no workaround) · S2 major (key function broken, workaround exists) · S3 minor · S4 cosmetic. Priority (business urgency) P1–P4, independent of severity.

**Release exit criteria (QA gate)**
1. 100% of acceptance tests green; locked files intact.
2. Every pertinent test type executed, or `No aplica: <reason>` approved by the user.
3. 0 open S1/S2 bugs.
4. SAST, SCA, secrets and DAST without high/critical.
5. Performance SLOs and every QS met with evidence.
6. Accessibility WCAG 2.2 AA without serious/critical.
7. AI evals at or above threshold (AI missions).
8. Rollback rehearsed (deployable deliverables).
9. Test completion report (29119-3) with residual risks accepted by the user.

## ECC tools for QA (in `vendor/ecc/`)
`agents/tdd-guide.md`, `skills/tdd-workflow`, `skills/<stack>-testing`, `rules/<stack>/testing.md` · `agents/e2e-runner.md`, `skills/e2e-testing` · `skills/browser-qa` (smoke, interaction, visual, axe → SHIP/NO SHIP) · `agents/gan-evaluator.md` (independent evaluator on the live app) · `skills/benchmark` (performance baseline, not load) · `agents/performance-optimizer.md` · `skills/verification-loop`, `skills/<framework>-verification` · `agents/pr-test-analyzer.md`, `commands/test-coverage.md` · `skills/loop-design-check` (green and no weakened tests) · `skills/ai-regression-testing` · `skills/eval-harness`, `skills/agent-eval`, `agents/agent-evaluator.md`, `skills/santa-method` · `agents/rag-pipeline-reviewer.md` · `agents/security-reviewer.md`, `skills/security-review` · `agents/a11y-architect.md`, `skills/accessibility` · `skills/contract-first` · `skills/database-migrations` · `skills/canary-watch` · `skills/i18n-sync` · `skills/click-path-audit`.

ECC does not cover (Shipwright provides the procedure via this catalog): mutation gates, Pact/Schemathesis, real load/stress/spike/soak, generic DAST and ASVS matrix, chaos, observability tests, rollback rehearsal, LLM-app evals and red teaming, exploratory charters, usability, 29119 documents, bug format, locked acceptance tests.
