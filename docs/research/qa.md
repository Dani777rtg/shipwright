# QA — baseline research (2026-10-14)

Source of the operational catalog [`reference/qa-catalog.md`](../../reference/qa-catalog.md) and of Phase 5 of `METHOD.md`.

## Framework
- **ISTQB CTFL 4.0.** Levels: component, component integration, system, system integration, acceptance. Types: functional, non-functional, black box, white box, confirmation and regression.
- **ISO/IEC 25010:2023.** 9 quality characteristics. It is the basis of the QGs.
- **ISO/IEC/IEEE 29119-3.** Test Strategy and Test Plan with a risk register, and a Completion Report with residual risks and lessons.
- **Risk-based testing:** probability × impact.
- **Shape:** pyramid for backends; trophy (more integration) for frontends.
- **OWASP ASVS 5.0** for authentication and authorization, and **OWASP LLM Top 10 2025** for LLM apps.

## What ECC covers
What ECC covers well:
- TDD per stack.
- E2E with Playwright.
- `browser-qa`: smoke, interaction, visual and axe, with a SHIP/NO SHIP verdict.
- `gan-evaluator`: independent evaluator on the live app.
- `loop-design-check`: "green and no test weakened".
- Verification loops: build, types, lint, tests, basic SAST and secrets.
- AI bug regression.
- Evals of coding agents.
- RAG review.
- Accessibility.
- Schema contracts.
- Migrations.
- Canary.

What it does **not** cover: mutation gates, Pact/Schemathesis, real load (stress, spike, soak), generic DAST and ASVS matrix, chaos, observability as a test, rollback rehearsal, evals and red team of LLM apps, exploratory charters, usability, 29119 documents, bug format and locked acceptance tests.

## Test integrity with AI agents
- **ImpossibleBench:** agents tamper with tests to pass. An explicit instruction ("the spec rules, do not modify tests") cut cheating from 92% to 1% in one of the measured scenarios.
- **Measures adopted in Shipwright:**
  - acceptance tests written by an independent QA agent;
  - hook lock, for both editing and the console;
  - SHA-256 fingerprints verified when QA starts;
  - holdout outside the repository;
  - test diff review;
  - coverage and mutation that cannot drop.

## Thresholds
The numeric thresholds in the catalog are indicative: mutation ≥ 70%, faithfulness ≥ 0.8, > 50 concurrent users to require load testing. No standard sets them. Each mission's strategy declares its own.

## Sources
- https://astqb.org/2-2-test-levels-and-test-types/
- https://www.iso.org/es/contents/data/standard/07/81/78176.html
- https://en.wikipedia.org/wiki/ISO/IEC_29119
- https://owasp.org/www-project-application-security-verification-standard/
- https://genai.owasp.org/llm-top-10/
- https://arxiv.org/html/2510.20270v1 (ImpossibleBench) · https://arxiv.org/pdf/2511.21654 (EvilGenie)
- https://anthropic.com/engineering/demystifying-evals-for-ai-agents
- https://www.w3.org/TR/WCAG22/ · https://web.dev/articles/vitals
- https://martinfowler.com/articles/practical-test-pyramid.html · https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- Tool versions: GitHub releases and PyPI/npm/NuGet registries, consulted on 2026-10-14.
