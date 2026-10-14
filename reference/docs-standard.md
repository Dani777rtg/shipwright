# Documentation standard — what every delivered repository contains

Used by the `docs-lead` agent. Structure follows **Diátaxis** (tutorials, how-to guides, reference, explanation). Docs live in the repository as Markdown next to the code ("docs as code") and are verified in QA like code. Write in the mission's deliverable language; be concise: one topic per page, no repetition, examples that run.

## Required documents

Each one exists or is marked `No aplica: <reason>` in `docs/qa/report.md`.

| Document | Diátaxis | Required when | Content |
|---|---|---|---|
| `README.md` | entry point | Always | What it is (2 lines), quick start that works on a clean machine, how to run tests, how to deploy, links to the rest. One screen |
| `docs/tutorial.md` | tutorial | There are end users or developers who will adopt it | First successful use, step by step, from zero |
| `docs/guides/*.md` | how-to | Recurring tasks exist (configure X, add a Y, operate Z) | One task per guide |
| API reference | reference | There is an API | Generated from the OpenAPI/AsyncAPI/GraphQL contract (never hand-written); errors and auth included |
| `docs/configuration.md` | reference | There is configuration | Every env var: purpose, default, required, example; never real secrets |
| `ARCHITECTURE.md` + `docs/adr/` | explanation | Always (from Architect) | arc42 + C4 + decisions |
| `docs/ops/runbook.md` | how-to | There is a deployment | Deploy, rollback, restore, rotate secrets, alerts |
| `docs/user-guide.md` | how-to | There is a UI for end users | Main tasks with screenshots |
| `CONTRIBUTING.md` | how-to | The repo will be maintained by others | Setup, conventions, branch/commit/PR rules, how to run checks |
| `CHANGELOG.md` | reference | Always | Keep a Changelog, generated from Conventional Commits |
| `SECURITY.md` | reference | Public repository or external users | How to report vulnerabilities, supported versions |
| `LICENSE` | — | Public or delivered to a third party | Chosen with the user |
| `docs/handover.md` | — | Always | Delivery document (template `templates/handover.md`) |
| Docs site | — | Only when there are external users (public product, API for third parties) | MkDocs Material (Python projects) or Starlight/Docusaurus (JS projects), built in CI, deployed with the product |

Existing systems: follow and extend the team's documentation layout; add only what is missing for the change, plus the handover.

## Per phase

| Phase | docs-lead |
|---|---|
| Architect | Documentation plan: which documents apply (table above), audiences, docs site yes/no, API reference generator |
| Plan | Documentation tasks in `tasks.md` (`serves:` the AC/O they explain) |
| Build | Docs updated in the same task as the code they describe (a task is not done if its docs are stale) |
| QA | Docs verification (below) |
| Ship | Final README, CHANGELOG for the release, handover; docs site published if applicable |

## Verification (QA gate)

| Check | Tool | Pass |
|---|---|---|
| Quick start works on a clean machine | Run the README commands in a fresh container / clean clone | Commands succeed as written |
| Code samples run | Execute or test every snippet (doctest, example tests) | All pass |
| Links | lychee | 0 broken links |
| Markdown | markdownlint-cli2 | 0 errors |
| API reference matches the contract | Generated from OpenAPI in CI; contract lint with Redocly CLI or Spectral | Reference regenerated, 0 lint errors |
| Docs match the code | `doc-updater` from ECC; every env var, command and endpoint in docs exists in code and vice versa | No drift |
| Prose (optional) | Vale | No errors with the chosen style |

## ECC tools (in `vendor/ecc/`)
`agents/doc-updater.md`, `commands/update-docs.md` (sync docs from source of truth), `commands/update-codemaps.md`, `agents/opensource-packager.md` (README, LICENSE, CONTRIBUTING, issue templates), `skills/codebase-onboarding`, `skills/code-tour`, `skills/living-docs-governance`, `skills/architecture-decision-records`, `skills/contract-first`.
