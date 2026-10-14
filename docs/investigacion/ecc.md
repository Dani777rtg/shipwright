# ECC (affaan-m/ecc) — análisis como base de Shipwright (2026-10-13)

Repo: https://github.com/affaan-m/ecc · versión 2.2.3 (2026-10-01) · último commit analizado 2026-10-11 · licencia **MIT** (© Affaan Mustafa).
Análisis de solo lectura (no se ejecutó nada del repo).

## Qué es
"Agent harness operating system": 71 agentes, 311 skills, 97 comandos (mayoría *legacy shims*), 27 hooks, 22 packs de reglas por lenguaje, configs MCP. Plugin de Claude Code + adaptadores para ~15 harnesses (Codex, Cursor, Gemini, OpenCode, Kiro…). ~103 MB. Un solo maintainer, ~450 commits/mes. Parte comercial (ECC Pro, sponsors).
Filosofía: agent-first, TDD (80% cobertura), security-first, plan before execute.
`ecc2/`: control plane en Rust (alpha), sin utilidad inmediata.

## Problemas para usarlo tal cual
- **Contexto:** descripciones de skills ≈ 25k tokens + agentes ≈ 4k, cargados siempre; ~la mitad de skills ajenas al desarrollo (trading, logística, marketing…).
- **Routing:** sus `/plan`, `planner`, `tdd-guide` competirían con nuestras fases.
- **Hooks pesados:** se disparan en cada tool use; doble spawn de node por hook; Stop con timeout 300 s; GateGuard cuesta 35–45% más turnos sin beneficio demostrado (su propio estudio).
- **Windows:** aprendizaje continuo v2 depende de bash+python; el observer no funciona en Windows nativo.
- **Seguridad:** observer LLM autónomo escribe "instincts" que se autoinyectan en SessionStart (vector de prompt injection); llamadas `claude -p` ocultas en hooks (coste + datos sin consentimiento visible); `mcp-health-check` hace HTTP a servidores MCP; configs MCP con `npx -y` sin versión y de patrocinadores. No se encontró telemetría remota.
- **Instalador** toca `~/.claude/settings.json` global.
- **Plugin no permite seleccionar skills** (todo o nada); `rules/` hay que copiarlas a mano.

## Decisión de integración

| Opción | Veredicto |
|---|---|
| Fork completo | Hereda 103 MB y 15 harnesses; diverge en semanas por el ritmo upstream |
| Dependencia (instalar ECC + Shipwright encima) | Sin control de versión, colisiones de routing, ~29k tokens + hooks en cada turno |
| **Cherry-pick adaptado (recomendado)** | Contexto mínimo, namespace propio, versionado nuestro; MIT solo exige conservar aviso |

Atribución: `THIRD_PARTY_NOTICES.md` con licencia MIT y copyright de Affaan Mustafa + commit de origen de cada pieza.

## Componentes a reutilizar por fase

| Fase | Pieza ECC | Calidad | Gap que construimos nosotros |
|---|---|---|---|
| Columna vertebral | `skills/orch-pipeline` (+ `orch-*`): Intake→Research→Plan→Scaffold→TDD→Review→Commit, clasificador de tamaño, 2 gates humanos | Mejor pieza estructural | Nuestras 8 fases, modos, gates por fase |
| Setup | `commands/project-init.md`, `rules/common`, `rules/<stack>` | Buena | Estructura de proyecto Shipwright |
| Intake | `commands/prp-prd.md` (PRD interactivo 7 fases con gates), `skills/intent-driven-development` (AC-NNN, alcance, supuestos) | Muy buena / excelente | **EARS**, IDs REQ/AC estables, entrevista adaptativa, glosario, graphify |
| Architect | `agents/architect.md`, `skills/architecture-decision-records`, `skills/contract-first`, `skills/council`, `skills/plan-canvas` | Media–buena | **arc42, MADR, C4**, catálogo de stack con criterios |
| Plan | `skills/blueprint` (pasos autocontenidos, DAG, paralelismo), `agents/planner.md` | Muy buena | **T001 [P]**, complejidad numérica, enlace tarea→AC |
| Build | `skills/tdd-workflow` (mapa tarea→test→evidencia RED/GREEN), `agents/tdd-guide.md`, `skills/dmux-workflows` | Muy buena | Protocolo subagente-por-tarea + worktree |
| Verify | `workflows/orch-review.workflow.js` (revisores paralelos + verificador adversarial, falla cerrado), `agents/code-reviewer.md` (filtro >80% confianza), `agents/security-reviewer.md`, `agents/e2e-runner.md` | Excelente | **Matriz AC→test + gate que falla si un AC no tiene test** |
| Ship | `skills/deployment-patterns`, `skills/docker-patterns`, `agents/doc-updater.md` | Buena (genérica) | Runbooks por plataforma, docs desde artefactos |
| Retro | `commands/learn-eval.md` (diff visible + aprobación explícita), `scripts/lib/skill-evolution/` (versioning snapshots + rollback, provenance, health), formato instinct (trigger/action/evidence/confidence) | Muy buena | Retro de **proceso** → PR al framework + semver |
| Hooks | `config-protection.js` (patrón exit 2 → proteger specs aprobadas), `hookify-runtime.js` (reglas declarativas en md), `post-edit-accumulator` + `stop-format-typecheck` (lint/tests una vez en Stop) | Buena | Un dispatcher Node por evento (Windows) |
| Evals | `skills/skill-comply` (mide si una skill se sigue de verdad), `docker/gateguard-effectiveness` (A/B honesto con decoys), validadores CI de frontmatter | Muy buena | Eval por skill modificada antes de release |
| Stack (catálogo) | 21 packs de reglas + skills por framework (django, fastapi, nextjs, springboot, laravel, flutter, swiftui…) | Materia prima | Criterios de selección |
| IA / hackatón | `eval-harness`, `agent-harness-construction`, `agent-security-hardening`, `mcp-server-patterns`, `cost-aware-llm-pipeline`, `prompt-caching-strategy`, `rag-pipeline-reviewer`, `ui-demo` | Buena | — |

## Evitar
GateGuard por defecto · observación en cada tool use + observer autónomo · `claude -p` oculto en hooks · `mcp-health-check` y MCPs de patrocinadores · `evaluate-session` v1 (placebo) · `.claude/*`, `contexts/*`, `scaffolds/` (stubs) · `multi-*` (runtime externo) · skills de dominio ajeno · bloque "Prompt Defense Baseline" repetido en cada agente (centralizar).
