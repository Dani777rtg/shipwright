# Documentation standard — what every delivered repository contains

Used by the `docs-lead` agent. Structure follows **Diátaxis** (tutorials, how-to guides, reference, explanation). Docs live in the repository as Markdown next to the code ("docs as code") and are verified in QA like code. Write in the mission's deliverable language; be concise: one topic per page, no repetition, examples that run.

## Required documents

Write only the ones whose "required when" holds; list the rest in one `Not applicable` line of `verify.md`.

| Document | Diátaxis | Required when | Content |
|---|---|---|---|
| `README.md` | entry point | Always | What it is (2 lines), quick start that works on a clean machine, how to run tests, how to deploy, links to the rest. One screen |
| `docs/tutorial.md` | tutorial | There are end users or developers who will adopt it | First successful use, step by step, from zero |
| `docs/guides/*.md` | how-to | Recurring tasks exist (configure X, add a Y, operate Z) | One task per guide |
| API reference | reference | There is an API | Generated from the OpenAPI/AsyncAPI/GraphQL contract (never hand-written); errors and auth included |
| `docs/configuration.md` | reference | There is configuration | Every env var: purpose, default, required, example; never real secrets |
| `docs/architecture.md` | explanation | The repo will be maintained by others and its design is not obvious from the code | One page: components, data flow, key decisions (from the spec's Decisiones and Diseño) |
| `<docsDir>/ops/runbook.md` | how-to | There is a deployment | Deploy, rollback, restore, rotate secrets, alerts |
| `docs/user-guide.md` | how-to | There is a UI for end users | Main tasks with screenshots |
| `CONTRIBUTING.md` | how-to | The repo will be maintained by others | Setup, conventions, branch/commit/PR rules, how to run checks |
| `CHANGELOG.md` | reference | Always | Keep a Changelog, generated from Conventional Commits |
| `SECURITY.md` | reference | Public repository or external users | How to report vulnerabilities, supported versions |
| `LICENSE` | — | Public or delivered to a third party | Chosen with the user |
| Docs site | — | Only when there are external users (public product, API for third parties) | MkDocs Material (Python projects) or Starlight/Docusaurus (JS projects), built in CI, deployed with the product |

Existing systems: follow and extend the team's documentation layout; add only what is missing for the change.

## When

Builders update the docs their change touches in the same task. At the end of Build, `docs-lead` makes one pass: writes what is still missing and proves the quick start on a clean clone. The CHANGELOG entry is written at Ship.

## Verification (end of Build)

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
