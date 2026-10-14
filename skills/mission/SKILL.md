---
name: mission
description: Start a Shipwright mission from a brief (build something from scratch or change an existing system). Classifies the mission, checks confidentiality and tools, drafts the mission card and explains the full plan to the user before any work starts. Use when the user runs /shipwright:mission or asks to start a new Shipwright mission.
argument-hint: "\"<mission brief>\""
disable-model-invocation: true
---

# Shipwright — Phase 0: MISSION

You are starting a Shipwright mission. Method reference: `${CLAUDE_PLUGIN_ROOT}/docs/METODO.md` (§2 mission, §3 objectives chain). Follow every step; never skip one silently. If a step truly does not apply, record `No aplica: <reason>` in the mission card.

Mission brief: $ARGUMENTS

## Rules for this phase
- Ask the user only through the AskUserQuestion tool: up to 4 questions per call, 2–4 options each, the recommended option first with "(Recomendado)" in its label.
- Write every user-facing artifact in the language of the brief (default: the user's language). Keep IDs and `serves:` lines exactly as in the templates.
- Do NOT read source code of an existing system before the confidentiality answer (step 3). Listing files and reading package manifests (package.json, pyproject.toml, go.mod, pom.xml, etc.) to detect the stack is allowed.

## Steps

1. **Brief.** If the brief is empty or a single vague phrase, ask for it (what is requested, by whom, for when, what must be delivered).

2. **Starting point.** Detect whether the working directory holds an existing system (a git repo with source files or package manifests).
   - Existing system detected → propose **sobre lo existente**, show what you detected (repo name, stack from manifests).
   - Empty or unrelated directory → propose **desde cero**. If the directory is not empty, ask whether to create the project in a new subfolder (propose a kebab-case name).
   - Also propose the **deliverable type**: app · funcionalidad · integración · arreglo · prueba de concepto · informe.
   Confirm both with one AskUserQuestion call (add the deadline and the deliverable language in the same call).
   In a second call ask: the data class (public · internal · personal · payments · health), where the users are (jurisdictions for data-protection law), and the deployment platform the user has (Azure, AWS, GCP, Render, Railway, Fly.io, Vercel, Netlify, Cloudflare, DigitalOcean, own server/VPS, Kubernetes, app stores, or "decide in Architect").

3. **Confidentiality (only sobre lo existente).** Ask: "¿Tu organización permite enviar el código de este sistema a Claude?" Options: Sí, tengo autorización (Recomendado) / Solo algunas partes / No o no sé. Record who authorized it.
   - "Solo algunas partes" → ask which folders; restrict all later analysis to them.
   - "No o no sé" → stop. Explain the options: get internal approval, restrict to allowed parts, or local-only analysis (`graphify update .` builds an AST graph locally without sending code). Continue only with one of those choices.

4. **Mission folder.**
   - desde cero → docs at `docs/` of the project folder; set up git per `${CLAUDE_PLUGIN_ROOT}/reference/git-workflow.md`: `git init -b main` if it is not a repo, a `.gitignore` for the stack including `.env*`, and `.github/pull_request_template.md` from `${CLAUDE_PLUGIN_ROOT}/templates/pull-request.md`.
   - sobre lo existente → docs at `docs/shipwright/<mission-slug>/` (ask if the team prefers another location).
   Create `.shipwright/state.json` at the project root:
   ```json
   { "docsDir": "<docs path>", "phase": "mission", "startingPoint": "desde-cero|existente", "deliverable": "<type>", "language": "<lang>", "mission": "<one line>", "confidentiality": "si|parcial|local", "allowedPaths": [], "shipwright": "0.8.0" }
   ```
   Then log the start: `node "${CLAUDE_PLUGIN_ROOT}/scripts/metrics.mjs" log mission start`.
   Run this and every later Shipwright script from the project root (the folder that holds `.shipwright/`).

5. **Tools.** Check `git --version`, `node --version`, `graphify --help`. For each missing tool, tell the user the install command (graphify: `pip install graphifyy`) and record it; graphify is required from Intake on.

6. **Mission card.** Copy `${CLAUDE_PLUGIN_ROOT}/templates/mission.md` to `<docsDir>/mission.md` and fill what is known now: mission sentence (verb + result), deliverable, starting point, confidentiality, deadline, language, people. Propose the quality goals in order as a draft (Intake confirms them):
   - desde cero → QG-1 tiempo hasta la entrega · QG-2 fiabilidad · QG-3 usabilidad
   - sobre lo existente → QG-1 no romper nada (compatibilidad/fiabilidad) · QG-2 seguridad · QG-3 consistencia con el equipo (mantenibilidad)
   Security is mandatory regardless of the QG order (`${CLAUDE_PLUGIN_ROOT}/reference/security-baseline.md`); also fill data class, jurisdictions and deployment platform.
   Agent hygiene: make sure `.env*` is in `.gitignore` and remind the user never to paste secrets into the conversation.
   Leave objectives (O), metrics (KR) and DoD details as placeholders for Intake.
   Also create `<docsDir>/client/` and tell the user to drop the brief's source material there (PDFs, notes, images, audio).

7. **Project CLAUDE.md.** desde cero → create a minimal `CLAUDE.md` linking to the mission card, stating the current phase and the commit convention (Conventional Commits with a `serves:` footer). sobre lo existente → ask before touching the team's `CLAUDE.md`; if refused, record `No aplica: el equipo no permite modificar CLAUDE.md`.

8. **Explain and confirm.** Show the user this summary, filled in, in the deliverable language:
   ```
   Misión: <frase>
   Punto de partida: <DESDE CERO | SOBRE LO EXISTENTE (repo, stack)>
   Entregable: <tipo> → <qué recibirás>
   Plazo: <plazo>

   Qué voy a hacer (método completo, con tu aprobación al final de cada fase):
    1. MISSION    Este resumen
    2. INTAKE     [existente: analizar tu sistema con graphify y extraer sus convenciones;]
                  analizar el material del encargo y entrevistarte con la checklist completa
    3. ARCHITECT  Diseñar la arquitectura [existente: documentar la actual y diseñar el cambio]
    4. PLAN       Dividir en tareas trazadas a los objetivos
    5. BUILD      Construir con tests primero, una tarea por subagente
    6. QA         Pruebas pertinentes y seguridad, por agentes independientes → SHIP / NO SHIP
    7. SHIP       Desplegar a producción en <plataforma>, verificado y con rollback
    8. RETRO      Extraer lecciones para mejorar el framework

   Prioridades de calidad propuestas: 1º … · 2º … · 3º …
   ```
   Ask with AskUserQuestion: Sí, empezar (Recomendado) / Cambiar punto de partida o entregable / Cambiar prioridades. Loop until confirmed.

9. **Close the phase.** On confirmation:
   - `node "${CLAUDE_PLUGIN_ROOT}/scripts/metrics.mjs" log mission gate-approved`
   - set `"phase": "intake"` in `.shipwright/state.json`
   - tell the user the next step: put source material in `<docsDir>/client/` (optional) and run `/shipwright:intake`.
