# Metodologías spec-driven con agentes IA (2026-10-13)

> Fiabilidad: mayoría de fuentes de terceros; estrellas son instantáneas aproximadas; nombres de comandos cambian entre versiones.

## Tabla

| Método | Fases / artefactos | Requisitos | Arquitectura | Tareas | Verificación | Automejora | ¿Claude Code? |
|---|---|---|---|---|---|---|---|
| GitHub Spec Kit (~125k★) | constitution → specify → clarify → plan → tasks → analyze → implement | Historias sin tecnología; `clarify` pregunta ambigüedades | plan.md + data-model + contracts, contra gates de la constitución | `T001 [P] [US1] ruta` | Gates, `analyze`, checklists | Constitución editable a mano | Sí |
| BMAD v6 (~51k★) | Analyst → PM → Architect → SM → Dev → QA; Quick Flow / Method / Enterprise | Brainstorming + PRD con épicas | architecture.md | Historias autocontenidas | QA + tests | Retro de épica | Sí |
| AWS Kiro | steering + requirements/design/tasks.md | Historias + **EARS** | design.md con diagramas | Checklist trazada | Criterios EARS testables | Steering editable | No nativo (cc-sdd lo clona) |
| Agent OS v3 | product → spec → tasks → implement → verify; foco en *standards* | Shaping questions | tech-stack + standards | tasks.md | Verificación por paso | Descubre standards del código | Sí |
| Claude Code nativo | CLAUDE.md, memoria, skills, comandos, subagentes, hooks, plugins, plan mode, AskUserQuestion | Plan mode + AskUserQuestion | Libre | TodoWrite | Hooks + subagentes revisores | Auto-memory, skill-creator con evals | — |
| SuperClaude | Comandos `/sc:*`, personas | `/sc:brainstorm` | Persona arquitecto | `/sc:task` | Persona QA | Parcial | Sí (consume mucho contexto) |
| Superpowers (~265k★) | brainstorm → worktree → plan → subagent-driven dev → TDD → review → finish | Socrático, una pregunta a la vez | Design doc | Tareas de 2–5 min con verificación | TDD estricto + review entre tareas | `writing-skills`, diagnóstico de transcripts | Sí (plugin) |
| Taskmaster AI | PRD → parse → complexity → expand → next | PRD manual | — | Grafo de dependencias + complejidad 1–10 | testStrategy por tarea | — | Sí (MCP) |
| OpenSpec | `specs/` (verdad) + `changes/` (deltas) → propose → apply → archive | WHEN/THEN | design.md opcional | tasks.md | Validación de deltas | Spec viva | Sí |
| GSD | `.planning/` PROJECT/REQUIREMENTS/ROADMAP/STATE; discuss → plan → execute → verify | Preguntas + research | map-codebase | Plan por fase en subagente nuevo | Verify por fase | STATE.md | Sí |
| Compound Engineering (Every) | brainstorm → plan → work → review → **compound** | Brainstorm | Plan técnico | Worktrees | Muchos revisores especialistas | `/ce:compound` → docs/solutions + CLAUDE.md | Sí |
| Tessl | Spec-as-source | Specs markdown | — | — | Tests ligados a spec | Registro de skills puntuadas | Vía MCP |

Taxonomía (Böckeler, martinfowler.com): spec-first (Spec Kit, Kiro), spec-anchored (OpenSpec), spec-as-source (Tessl). **Shipwright = spec-anchored**: la spec vive y evoluciona con el proyecto.

## Buenas prácticas

**Entrevista de requisitos:** una pregunta a la vez, neutral, sin sesgo; repreguntar solo para aclarar; parar a ~95% de confianza; devolver resumen para validar. Errores típicos de entrevistadores LLM: preguntas mal formuladas, temas omitidos, mal orden (LLMREI). Repreguntas guiadas por lista de errores conocidos superan a humanos (arXiv 2507.02858). Salida: historias + EARS + fuera de alcance + suposiciones.

**Arquitectura para LLMs:** Markdown + Mermaid; ADR en MADR (uno por archivo, numerado, con estado); C4 solo niveles 1–2; arc42 como esqueleto, `TBD` en lugar de inventar.

**Automejora:** paso compound/reflect tras cada ciclo con aprobación humana; lecciones como skills, no engordando CLAUDE.md; evals de skills con y sin cambio; diagnóstico de transcripts; poda periódica y límites de tamaño.

## Fuentes
- https://github.com/github/spec-kit
- https://www.augmentcode.com/guides/bmad-method-ai-development
- https://kiro.dev/docs/specs/concepts
- https://buildermethods.com/agent-os/v2/version-2
- https://github.com/obra/superpowers
- https://docs.task-master.dev/command-reference
- https://openspec.dev/docs/getting-started
- https://www.mintlify.com/gsd-build/get-shit-done/concepts/context-engineering
- https://every.to/guides/compound-engineering
- https://www.martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
- https://arxiv.org/abs/2507.02858
- https://arxiv.org/pdf/2410.01824
- https://towardsdatascience.com/how-i-continually-improve-my-claude-code/
