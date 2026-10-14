---
name: intake
description: Shipwright phase 1 — understand the problem (and the existing system when the mission changes one). Analyzes client material and code with graphify, runs the complete interview checklist with multiple-choice questions, researches "no sé" answers, and writes the mission objectives plus EARS requirements traced to them. Use when the user runs /shipwright:intake after a confirmed mission.
disable-model-invocation: true
---

# Shipwright — Phase 1: INTAKE

Method reference: `${CLAUDE_PLUGIN_ROOT}/docs/METODO.md` §3 (objectives chain) and §4 (Intake). Follow every step; nothing is skipped silently — what does not apply becomes `No aplica: <reason>` in the mission card.

## Preconditions
Read `.shipwright/state.json` (project root). If it is missing or `phase` is `mission`, tell the user to run `/shipwright:mission` first and stop. Use `docsDir`, `startingPoint`, `language`, `confidentiality` and `allowedPaths` from it. Read `<docsDir>/mission.md`.

## Rules
- All questions go through AskUserQuestion: up to 4 per call, 2–4 options each, recommended option first with "(Recomendado)". Pre-fill options from what you already know; never ask what the material already answers — confirm it instead.
- User-facing artifacts are written in `language`. IDs and `serves:` lines follow the templates exactly.
- ECC tools: see `${CLAUDE_PLUGIN_ROOT}/reference/using-ecc.md` for how to run an ECC agent or skill on demand.
- Respect `confidentiality`: `local` → only `graphify update .` (local AST, sends no code) and no semantic extraction of code; `parcial` → analyze only `allowedPaths`.

## Steps

### 1. Understand the existing system (sobre lo existente only)
1. Build the code graph: invoke the `graphify` skill on the repo root (or on each allowed path), or `graphify update .` when confidentiality is `local`. Read `graphify-out/GRAPH_REPORT.md`.
2. Run, in parallel, two ECC agents as subagents (per `using-ecc.md`):
   - `agents/code-architect.md` — task: extract the team's conventions (naming, structure, error handling, tests, commits, config) with file:line evidence.
   - `agents/spec-miner.md` — task: describe the current behaviour relevant to the mission as Requirement/WHEN→THEN with the file and test that cover it.
3. Write `<docsDir>/spec/existing-system.md` from `${CLAUDE_PLUGIN_ROOT}/templates/existing-system.md`, including integration points and blast radius (`graphify affected "<component>" --depth 2` for the components the mission will touch).
4. Show the user a 5-line summary of the system and confirm the conventions (checklist §15).

For desde cero record `No aplica: misión desde cero` for this step.

### 2. Analyze the client material
If `<docsDir>/client/` has files, invoke the `graphify` skill on it with `--mode deep`. From `GRAPH_REPORT.md` take: central entities (candidate glossary terms and modules), communities (candidate capabilities) and every `AMBIGUOUS` edge (each becomes an interview question). If the folder is empty, record that the brief is the only source.

### 3. Interview — complete checklist
Read `${CLAUDE_SKILL_DIR}/checklist.md`. Cover **every** section, in order, in batches of up to 4 questions:
- Start each batch with one line saying which section you are on and how many remain.
- Prefer concrete options built from the material (e.g. three plausible KR targets) over open questions.
- **"No sé" answers:** research before moving on — web search, the sponsor's or client's docs, the graph of past missions (`graphify` global graph / `lessons/LESSONS.md` of the plugin if present). Come back with 2–4 grounded options, each with its source, and ask again. If still unresolved, record it as an assumption with an owner and a "confirm before" date.
- For the quality goals, offer the defaults from the mission card and alternatives; the user orders the final top 3.
- Use ECC's `commands/prp-prd.md` (problem, evidence, JTBD, MoSCoW) and `skills/intent-driven-development` (acceptance criteria, scope in/out, blocking decisions) as reference for how to probe; the checklist remains the coverage contract.

### 4. Write the artifacts
1. `<docsDir>/mission.md`: complete objectives `O-n`, metrics `KR-n` (each `serves: O-n — <how>`), the ordered `QG-1..3` (each `serves:` an O or KR with the reason), restrictions, Definition of Done, out of scope / parking, assumptions with owner, and the `No aplica` list.
2. `<docsDir>/spec/requirements.md` from `${CLAUDE_PLUGIN_ROOT}/templates/requirements.md`: context; user stories `US-NN` with MoSCoW and `serves: O-n — <how>`; acceptance criteria `AC-NN.M` in EARS with `serves: US-NN — <what it verifies>`; measurable non-functional requirements; out of scope; assumptions; open questions.
   - Every Must story has at least one happy-path AC and one unwanted-behaviour AC (IF … THEN).
   - Every AC is verifiable by an automated test or a stated manual check.
3. `<docsDir>/spec/glossary.md` from `${CLAUDE_PLUGIN_ROOT}/templates/glossary.md`.

### 5. Traceability check
Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/trace.mjs" <docsDir> --phase intake`. Fix every problem and re-run until it prints OK. Never silence a problem by deleting a requirement; ask the user if a fix needs a decision.

### 6. Independent reviews
Spawn in parallel:
- `shipwright:analyst` with the paths of mission.md, requirements.md, glossary.md, existing-system.md (if any) and `${CLAUDE_SKILL_DIR}/checklist.md`.
- `shipwright:qa-lead` with task **A (testability review)** and the same paths. Store the project profile it proposes in `.shipwright/state.json` under `"qaProfile"`; Architect uses it for the Test Strategy.
- `shipwright:security-lead` with task **A (requirements)** and the same paths. Add the security and privacy criteria it lists (or their `No aplica`) to requirements.md, record the ASVS level it proposes for the user to approve at the gate, and write `docs/security/data-inventory.md` when there is personal data.

Apply their findings; findings that need a decision go to the user via AskUserQuestion. Re-run step 5 after changes.

### 7. Gate
Present:
- 5-line summary of the problem and the objectives
- Counts: objectives, KRs, stories (by MoSCoW), ACs, assumptions, open questions
- The ordered quality goals and the proposed ASVS level
- Everything marked `No aplica` and every open assumption
- Paths of the artifacts

Ask with AskUserQuestion: Aprobar (Recomendado) / Pedir cambios / Volver a la misión.
- Log the outcome: `node "${CLAUDE_PLUGIN_ROOT}/scripts/metrics.mjs" log intake gate-approved|gate-changes|gate-back "<short note>"`.
- Pedir cambios → apply them, repeat steps 5–7.
- Volver a la misión → set `phase` to `mission` in state.json and tell the user to run `/shipwright:mission`.
- Aprobar → set `status: approved` in the frontmatter of mission.md and requirements.md (from now on they change only through `/shipwright:change`), set `"phase": "architect"` in state.json, and tell the user the next step is `/shipwright:architect` (available in a later Shipwright version).
