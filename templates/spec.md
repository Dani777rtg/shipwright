---
status: draft
---
# <Mission: verb + result, one sentence>

<!-- Write this document in the user's language; headings and keywords may be translated
     (risk/riesgo, Not applicable/No aplica, Budget exceeded/Presupuesto excedido are both accepted). -->

| Field | Value |
|---|---|
| Deliverable | app · feature · integration · fix · proof of concept · report |
| Starting point | from scratch · existing system (`<repo>`) |
| Deadline | `<date and time>` |
| Language | `<language>` |
| Data and law | public · internal · personal · payments · health — <applicable law> — ASVS <L1/L2/L3> |
| Platform | <the one the project uses · to decide · none (PR)> |
| Confidentiality | <code may be sent to Claude: yes / partial / local — authorized by `<who>`> |
| Approver | <who> |

## Objectives

<!-- When <situation>, <actor> wants <progress> so that <outcome> — measure: <number and how it is measured>. -->
- O-1: When …, … wants … so that … — measure: …

## Quality priorities

1. <attribute> — <why it ranks first>
2.
3.

## Current system

<!-- Existing systems only; otherwise delete. Facts with their file, not opinions: stack, how tests run,
     conventions (file:line), what must not change, integration points. Code map: graphify-out/GRAPH_REPORT.md -->

## Stories and criteria

<!-- MoSCoW. risk: high if it touches money, personal data, permissions or isolation, an external integration, or bulk
     or irreversible data operations; otherwise low. When in doubt, high.
     EARS criteria: WHEN <event> / IF <condition> THEN / WHILE <state> … THE SYSTEM SHALL <verifiable response>.
     Every Must story: at least one happy-path criterion and one unwanted-behaviour criterion. -->

### US-01 <title> (Must)
As a <role>, I want <capability> so that <benefit>.
serves: O-1
risk: low — <reason>

- **AC-01.1** WHEN <event> THE SYSTEM SHALL <verifiable response>
  serves: US-01
- **AC-01.2** IF <unwanted condition> THEN THE SYSTEM SHALL <response>
  serves: US-01

## Expert input (ECC)

<!-- One line per area: which ECC expert or skill was consulted and what it decided.
     Architecture: agents/architect.md (+ skills/api-design, agents/database-reviewer.md when relevant).
     Development: the stack skills that will be installed. QA: skills/tdd-workflow, skills/e2e-testing. -->

## Decisions

<!-- Only those that change something: stack, data, authentication, integration, deployment, every new dependency. -->
| Decision | Rejected alternative | Why |
|---|---|---|
| | | |

## Design

<!-- The minimum so builders do not collide: components and key flow (≤ 15 lines or one Mermaid diagram),
     data model changes, contracts (path of the OpenAPI file if there is an API). Nothing no story needs. -->

## Threats

<!-- High-risk stories only; otherwise delete. Each threat with its mitigation as a criterion or a task
     (the task carries serves: TM-n). Each threat is a list item with this content:
     TM-1: <asset> · <what can go wrong> · mitigation: <AC or task> — serves: US-NN -->

## Tests

- Acceptance tests: `<path, e.g. tests/acceptance/>` (written by QA, locked).
- Pertinent: <type — reason, one line each; heavy types only for high-risk stories>.
- Not applicable: <other types> — <reason>.

## Tasks

<!-- Vertical slices: 1–3 tasks per story. [P] = touches different files and depends on no open task. -->

### T001 [P] [US-01] <title>
serves: AC-01.1, AC-01.2
- Files: `<paths>`
- Check: `<command or test>`
- depends: —

## Assumptions and open questions

| Assumption | Owner | Confirm before |
|---|---|---|
| | | |

## Out of scope

-
