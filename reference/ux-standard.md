# UX/UI standard — products with an interface

Used by the `ux-lead` agent when the mission has a user interface (web, mobile, desktop). Otherwise the whole discipline is `No aplica: <reason>`. Grounded in: Nielsen's 10 usability heuristics, WCAG 2.2 AA, design tokens (W3C Design Tokens format), mobile-first responsive design.

## Per phase

| Phase | ux-lead | Artifact |
|---|---|---|
| Intake | Primary users and their 3–5 key tasks (from the interview); devices and contexts of use; existing brand or design system | Section in `requirements.md` |
| Architect | User flows for every key task; screen inventory; every screen's states (empty, loading, error, success, no permission); wireframes as a clickable low-fidelity HTML prototype; design system (tokens: color, type, spacing, radius, shadow; base components); microcopy and error messages; responsive breakpoints | `<docsDir>/ux/ux-spec.md`, `<docsDir>/ux/prototype/`, `design-tokens.json` |
| Architect gate | **The user walks the prototype and approves it** before any production UI is built | — |
| Build | UI built from the tokens and components only; no ad-hoc colors or spacing; each screen implements all its states | — |
| QA | Heuristic review (10 heuristics, severity 0–4); accessibility (with qa-catalog); visual regression against approved screens; key tasks completed in exploratory sessions | Section in `<docsDir>/qa/report.md` |
| Ship | Screenshots for the user guide and README | `docs/` |

Existing systems: extract the current design system first (ECC `skills/design-system`) and follow it; new patterns need an ADR.

## Exit criteria
- Every key task has a flow and is completable in the prototype and in the product.
- Every screen implements its five states.
- Contrast and target sizes meet WCAG 2.2 AA; full keyboard operation on web.
- No severity 3–4 heuristic problems open.
- UI uses only design tokens (lint or review).

## ECC tools (in `vendor/ecc/`)
`skills/design-system` (extract or audit tokens), `skills/frontend-design-direction`, `commands/gan-design.md` (generator/evaluator design loop), `agents/a11y-architect.md`, `skills/accessibility`, `skills/frontend-a11y`, `skills/frontend-patterns`, `skills/ui-demo` (demo video).
