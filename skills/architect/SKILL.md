---
name: architect
description: Shipwright phase 3 — design how the mission is built. Measurable quality scenarios, stack and ADRs, arc42 architecture with C4 diagrams, and in parallel the threat model, test strategy, deploy plan, documentation plan and (with a UI) a clickable prototype. Ends with the user's approval and the installation of the stack packs. Use when the user runs /shipwright:architect after an approved intake.
disable-model-invocation: true
---

# Shipwright — Phase 3: ARCHITECT

Method: `${CLAUDE_PLUGIN_ROOT}/docs/METODO.md` §3–§5. Every step runs; what does not apply becomes `No aplica: <reason>`. The architecture's only objective is to meet the ordered quality goals (QG) with the fewest pieces — no component, dependency or pattern without a scenario, story or decision that needs it.

## Preconditions
Read the state (`node "${CLAUDE_PLUGIN_ROOT}/scripts/state.mjs" get`). Continue only if `phase` is `architect` and `<docsDir>/mission.md` and `<docsDir>/spec/requirements.md` have `status: approved`; otherwise say which phase to run and stop. Read the mission card, requirements, glossary and `existing-system.md` (if any).

## Rules
- Ask only through AskUserQuestion (≤ 4 questions per call, recommended option first).
- User-facing artifacts in the deliverable language; IDs and `serves:` lines exactly as in the templates.
- ECC tools on demand per `${CLAUDE_PLUGIN_ROOT}/reference/using-ecc.md`: `agents/architect.md` and `agents/code-architect.md` (design input; code-architect for existing systems), `skills/architecture-decision-records`, `skills/contract-first` and `skills/api-design` (APIs), `skills/council` (disputed decisions), `skills/hexagonal-architecture` (when boundaries matter).

## Steps

### 1. Context
- Query the graphs: `/graphify query` on the client-material and code graphs (if present) for each Must story and QG, in the language of the graph labels.
- Lessons from past missions: `${CLAUDE_PLUGIN_ROOT}/lessons/LESSONS.md` and, if available, the graphify global graph.

### 2. Quality scenarios
For each QG write one or more QS (fuente · estímulo · entorno · artefacto · respuesta · medida, with a number and unit), `serves: QG-n`. Add scenarios required by the security baseline (e.g. authorization, rate limits) when they are architecturally significant. Confirm the numbers with the user in one AskUserQuestion batch (offer 2–3 realistic targets each).

### 3. Stack and decisions
- Desde cero: shortlist from `${CLAUDE_PLUGIN_ROOT}/docs/catalogo-stack.md` against the QG order, constraints and the user's deployment platform; ask the user to choose (recommended first, with trade-offs).
- Sobre lo existente: the current stack; any new dependency or pattern needs its own ADR.
- Write one ADR per significant decision in `<docsDir>/adr/NNNN-<slug>.md` from `${CLAUDE_PLUGIN_ROOT}/templates/adr.md` (`serves: QS-n` or `TM-n`, real alternatives, consequences). Stack, data store, authentication, integration style and deployment always get an ADR.

### 4. Architecture document
Write `<docsDir>/architecture/ARCHITECTURE.md` from `${CLAUDE_PLUGIN_ROOT}/templates/architecture.md`: scenarios, constraints, C4 L1–L2 (Mermaid), components `C-n` with `serves:`, data model, contracts (write the OpenAPI/AsyncAPI/schema file when there is an API), 2–3 key sequence flows, cross-cutting decisions, risks and the traceability table. Existing system: current state first, then the change. Unknowns are `TBD` with an owner and a question.

### 5. Specialists, in parallel
Spawn in one message (each gets the paths of the mission card, requirements, ARCHITECTURE.md and ADRs):
- `shipwright:security-lead` — task **B**: `<docsDir>/security/threat-model.md` and security ADR proposals.
- `shipwright:qa-lead` — task **B**: `<docsDir>/qa/test-strategy.md` (use `qaProfile` from state.json).
- `shipwright:devops-lead` — task **A**: `<docsDir>/ops/deploy-plan.md` for the platform in the mission card.
- `shipwright:docs-lead` — task **A**: documentation plan table.
- `shipwright:ux-lead` — task **B** when there is a UI: `<docsDir>/ux/ux-spec.md`, `<docsDir>/ux/prototype/`, `design-tokens.json`. Otherwise record `No aplica: sin interfaz de usuario`.

Integrate their output: write the ADRs they propose, link their artifacts in ARCHITECTURE.md §9–10, add the documentation plan table, and resolve conflicts between them (ask the user when a conflict changes scope, cost or the QG order).

### 6. Review and traceability
- Spawn `shipwright:architecture-reviewer` with all the artifacts; fix its findings (decisions go to the user).
- `node "${CLAUDE_PLUGIN_ROOT}/scripts/trace.mjs" <docsDir> --phase architect` until OK.

### 7. Gate
Present: the design in 5 lines; stack and platform with estimated monthly cost; the QS with their numbers; ASVS level and the top threats; the test types marked pertinent and the ones marked `No aplica`; the documentation plan; open `TBD`s and risks. If there is a prototype, ask the user to open `<docsDir>/ux/prototype/index.html` and walk each key task before answering.

AskUserQuestion: Aprobar (Recomendado) / Pedir cambios / Volver a intake. Log with `node "${CLAUDE_PLUGIN_ROOT}/scripts/metrics.mjs" log architect gate-approved|gate-changes|gate-back "<note>"`.
- Pedir cambios → apply, repeat steps 6–7.
- Volver a intake → approved requirements change only through `/shipwright:change`; explain and stop.
- Aprobar →
  1. Set `status: approved` in ARCHITECTURE.md, threat-model.md, test-strategy.md, deploy-plan.md and ux-spec.md, and `status: accepted` in each ADR.
  2. Stack packs: search `${CLAUDE_PLUGIN_ROOT}/vendor/ecc.index.md` under `## stack` (and `## ai` for AI missions) for the chosen languages and frameworks — rules (`rules/<lang>`, `rules/web` for web UIs, `rules/common`), framework skills, testing skills and language reviewer agents. Show the list, then run `node "${CLAUDE_PLUGIN_ROOT}/scripts/install-packs.mjs" <paths...>` from the project root.
  3. `node "${CLAUDE_PLUGIN_ROOT}/scripts/state.mjs" set phase plan` and tell the user the next step is `/shipwright:plan`.

## Session
Principles for every step: `${CLAUDE_PLUGIN_ROOT}/reference/engineering-principles.md` (subagent reports and progress notes terse; questions, gates and artifacts in clear prose). If this conversation grows long inside the phase, suggest `/compact`. When the phase closes, tell the user: run `/clear`, then `/shipwright:plan` — everything the next phase needs is in files, and the session-start hook restores the mission context.
