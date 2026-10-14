# Método Shipwright

> Documento maestro. Define el camino completo desde "me llegan requisitos" hasta "software en producción, documentado y con lecciones aprendidas".
> Versión del método: **v0.2.0** (solo documentación; base de agentes: ECC).

---

## 1. Objetivo

Construir software **en el menor tiempo posible**, con **calidad de código y de documentación de nivel profesional**, siguiendo un **camino fijo y repetible** en lugar de prompts improvisados.

Tres métricas que el método optimiza (y mide en cada proyecto, ver §9):

| Métrica | Qué se mide |
|---|---|
| Velocidad | Horas desde requisitos recibidos hasta entrega, por fase |
| Calidad de software | Tests pasando, cobertura de criterios de aceptación, defectos post-entrega, hallazgos de revisión |
| Calidad de documentación | Spec, arquitectura, ADRs y README completos y consistentes con el código |

## 2. Principios

1. **Spec antes que código.** Nada se implementa sin requisito escrito y criterio de aceptación verificable.
2. **Un camino, dos modos.** Mismo pipeline siempre; el modo cambia profundidad, no el orden (§4).
3. **Puertas humanas.** Al final de cada fase, el humano aprueba antes de avanzar (§5).
4. **El grafo es la memoria.** `/graphify` se usa en todas las fases: requisitos, arquitectura, código y lecciones (§7).
5. **Contexto limpio.** El hilo principal orquesta; el trabajo pesado va en subagentes que se comunican por archivos (evita *context rot*).
6. **Lo no negociable es determinista.** Tests, lint y protección de specs aprobadas se aplican con hooks, no con "por favor" en un prompt.
7. **Nunca el mismo error dos veces.** Cada proyecto termina en retrospectiva; cada lección aprobada cambia el framework y genera una versión nueva (§8).
8. **Lo mínimo que funciona.** YAGNI en el código del producto y en el propio framework.

## 3. Pipeline

```
 requisitos del cliente
        │
 [0] SETUP ──► [1] INTAKE ──► [2] ARCHITECT ──► [3] PLAN ──► [4] BUILD ──► [5] VERIFY ──► [6] SHIP ──► [7] RETRO
                  ▲ gate          ▲ gate           ▲ gate        (por tarea)     ▲ gate        ▲ gate        │
                  └─────────────── cambios de alcance vuelven a INTAKE ─────────────────────────────────────┘
                                                                         lecciones ──► nueva versión del framework
```

| # | Fase | Comando (v1) | Entrada | Artefactos de salida | Gate |
|---|---|---|---|---|---|
| 0 | Setup | `/shipwright:new` | nombre, modo | repo del proyecto, `CLAUDE.md`, `docs/`, hooks | — |
| 1 | Intake | `/shipwright:intake` | docs del cliente (PDF, notas, audios, imágenes) | `docs/spec/requirements.md`, `docs/spec/glossary.md`, grafo de requisitos | Humano aprueba spec |
| 2 | Architect | `/shipwright:architect` | spec aprobada | `docs/architecture/ARCHITECTURE.md`, `docs/adr/NNNN-*.md`, diagramas C4 | Humano aprueba arquitectura |
| 3 | Plan | `/shipwright:plan` | spec + arquitectura | `docs/plan/tasks.md` | Humano aprueba plan |
| 4 | Build | `/shipwright:build` | tasks.md | código + tests, grafo de código actualizado | Automático (hooks) por tarea |
| 5 | Verify | `/shipwright:verify` | código | `docs/verify/report.md` (trazabilidad requisito → test) | Humano aprueba release |
| 6 | Ship | `/shipwright:ship` | release aprobada | deploy, `README.md`, `CHANGELOG.md`, docs de usuario | Humano confirma deploy |
| 7 | Retro | `/shipwright:retro` | todo el proyecto + métricas | `docs/retro.md`, propuestas de cambio al framework | Humano aprueba cambios al framework |

### Fase 0 — Setup
- Crea el repo del proyecto **en su propia carpeta** (el framework se instala como plugin, no se copia).
- Elige modo: `hackathon` o `client`.
- Genera `CLAUDE.md` mínimo del proyecto + `docs/` vacío + hooks.
- Comprueba herramientas: git, graphify (`graphify --help`), runtime del lenguaje.

### Fase 1 — Intake (toma de requisitos y entendimiento del problema)
Objetivo: entender el problema mejor que el cliente y dejarlo por escrito sin ambigüedad.

1. **Ingesta:** los documentos del cliente van a `docs/client/`. Se ejecuta `/graphify docs/client --mode deep`.
2. **Lectura del grafo:** `GRAPH_REPORT.md` da entidades centrales (god nodes), comunidades (posibles módulos) y aristas `AMBIGUOUS` → cada una es una pregunta abierta.
3. **Entrevista interactiva** (AskUserQuestion, opciones múltiples):
   - Una pregunta por tema, redacción neutral, siempre con opción recomendada.
   - Checklist de cobertura obligatoria: usuarios y roles, problema y objetivo de negocio, flujos principales, datos, integraciones, requisitos no funcionales (rendimiento, seguridad, privacidad, disponibilidad), plataforma, plazo, presupuesto, criterio de éxito de la demo/entrega.
   - Se detiene cuando la confianza es alta (~95%) o el usuario corta; lo no resuelto queda como **suposición explícita**.
4. **Spec:** `requirements.md` con:
   - Contexto y objetivo (1 párrafo).
   - Historias de usuario `US-NN`, priorizadas (MoSCoW).
   - Criterios de aceptación en **EARS** por historia (`WHEN <evento> THE SYSTEM SHALL <respuesta>`), cada uno con ID `AC-NN.M` → se convierte 1:1 en test.
   - Requisitos no funcionales medibles.
   - **Fuera de alcance** y **suposiciones** (listas explícitas).
   - Preguntas abiertas para el cliente.
5. **Revisión:** subagente *analyst* revisa la spec buscando contradicciones, huecos y criterios no verificables.
6. **Gate:** el humano aprueba. La spec aprobada queda protegida por hook (solo se cambia vía nuevo intake).

### Fase 2 — Architect (formulación detallada de arquitectura)
1. **Contexto:** `/graphify query` sobre el grafo de requisitos para ver qué requisitos tocan cada área; god nodes y comunidades sugieren módulos.
2. **Memoria:** consulta el grafo global de proyectos pasados y `LESSONS.md` (¿hemos resuelto algo parecido? ¿qué falló?).
3. **Stack:** se elige con `docs/catalogo-stack.md` (decisión por proyecto, justificada).
4. **Documento** `ARCHITECTURE.md` con esqueleto **arc42** reducido:
   1. Objetivos y restricciones
   2. Contexto (C4 nivel 1, Mermaid)
   3. Contenedores (C4 nivel 2, Mermaid)
   4. Modelo de datos
   5. Contratos de API / interfaces
   6. Flujos clave (diagramas de secuencia de los 2–3 flujos críticos)
   7. Decisiones transversales: auth, errores, logging, configuración, seguridad
   8. Riesgos y deuda técnica conocida
   9. Matriz requisito → componente
   - Lo desconocido se marca `TBD`, nunca se inventa.
5. **ADRs** en formato **MADR**: un archivo por decisión relevante (stack, base de datos, auth, despliegue…), con opciones consideradas y consecuencias.
6. **Revisión:** subagentes *architect-reviewer* (coherencia, simplicidad) y *security-reviewer* (OWASP; usa la skill `web-security-audit` si aplica).
7. **Gate:** el humano aprueba.

### Fase 3 — Plan
- Descompone en tareas de **2–15 min de agente**, cada una con: ID `T001`, historia `[US-NN]`, marca `[P]` si es paralelizable, rutas de archivo, criterios `AC` que cubre, paso de verificación.
- Complejidad 1–10; toda tarea > 6 se divide.
- Orden: esqueleto ejecutable primero (walking skeleton: build + deploy vacío funcionando), luego verticales por historia según prioridad.
- **Chequeo de consistencia** spec ↔ arquitectura ↔ tareas: todo `AC` debe tener al menos una tarea; toda tarea debe trazar a un `AC` o a una decisión de arquitectura.
- **Gate:** el humano aprueba.

### Fase 4 — Build
- Un **subagente nuevo por tarea** (contexto limpio), con la tarea autocontenida como entrada.
- **TDD:** test del criterio EARS primero (rojo) → implementación mínima (verde) → refactor.
- Tareas `[P]` en paralelo con git worktrees.
- Hooks: tests + lint + typecheck en cada cambio; bloqueo de edición de spec aprobada.
- Tras cada tarea: revisión breve por subagente *reviewer*, commit, `graphify update .` (solo AST, gratis).
- Desviación de la arquitectura → se registra ADR nuevo antes de seguir.

### Fase 5 — Verify
- Ejecuta todos los tests; genera **matriz de trazabilidad** `AC → test → estado`.
- Revisiones paralelas: correctitud (`/code-review`), seguridad, sobreingeniería (`/ponytail-review`), documentación vs código.
- Prueba E2E de los flujos críticos (navegador si es web).
- `report.md` con veredicto por requisito: verified / partial / failed.
- **Gate:** el humano aprueba la release.

### Fase 6 — Ship
- Deploy (el destino se decide en arquitectura).
- Documentación final: README (instalar, ejecutar, arquitectura en 1 imagen), CHANGELOG, docs de usuario si aplica.
- Grafo final del proyecto: `/graphify . --update` y alta en el grafo global (`graphify global add graphify-out/graph.json --as <proyecto>`).
- **Gate:** el humano confirma antes de cualquier deploy o publicación.

### Fase 7 — Retro (automejora)
Ver §8.

## 4. Modos

| Aspecto | `hackathon` | `client` |
|---|---|---|
| Intake | Entrevista corta (≤ 8 preguntas), solo Must | Entrevista completa, MoSCoW completo |
| Arquitectura | C4 L1 + 1 diagrama, ADRs solo para stack | arc42 completo, ADR por decisión |
| Plan | Tareas grandes, sin chequeo formal | Tareas finas + chequeo de consistencia |
| Tests | Flujo demo + criterios Must | TDD en todo, cobertura de todos los AC |
| Verify | Smoke + demo E2E | Matriz completa + revisión de seguridad |
| Gates | Spec y arquitectura en una sola aprobación | Una aprobación por fase |
| Docs | README + diagrama | Docs completos |
| Retro | Obligatoria (5 min) | Obligatoria |

## 5. Puertas (gates)

En cada gate el agente presenta: resumen de 5 líneas, artefacto generado, riesgos/suposiciones, y pregunta con opciones: **Aprobar / Pedir cambios / Volver a fase anterior**. Nunca avanza sin respuesta explícita.

## 6. Estructura de un proyecto generado

```
mi-proyecto/
├── CLAUDE.md                  # contexto mínimo del proyecto + modo + enlaces a docs
├── docs/
│   ├── client/                # material original del cliente (inmutable)
│   ├── spec/requirements.md
│   ├── spec/glossary.md
│   ├── architecture/ARCHITECTURE.md
│   ├── adr/0001-*.md
│   ├── plan/tasks.md
│   ├── verify/report.md
│   ├── metrics.md             # tiempos y métricas por fase (alimenta la retro)
│   └── retro.md
├── graphify-out/              # grafo del proyecto
├── src/ …
└── tests/ …
```

## 7. Uso de graphify en cada fase

| Fase | Comando | Para qué |
|---|---|---|
| Intake | `/graphify docs/client --mode deep` | Entidades, módulos y ambigüedades del material del cliente |
| Intake | `/graphify add <url>` | Añadir referencias web del cliente |
| Architect | `/graphify query "…"`, `/graphify path "A" "B"`, `graphify god-nodes` | Agrupar requisitos en componentes, ver dependencias |
| Architect | grafo global + `LESSONS.md` | Reutilizar soluciones y evitar errores pasados |
| Build | `graphify hook install` / `graphify update .` | Grafo de código siempre al día (AST, sin coste) |
| Build | `graphify affected "X" --depth 2` | Impacto antes de tocar un componente |
| Ship | `/graphify . --update` + `graphify global add` | Grafo final al historial global |
| Retro | `graphify save-result` + `graphify reflect` | Registrar qué funcionó / qué no → `LESSONS.md` |

Gotchas conocidos:
- `query` busca subcadenas literales: en español contra etiquetas en inglés da 0 resultados → consultar con términos en el idioma de las etiquetas.
- Hook y `--watch` solo actualizan código; los docs requieren `/graphify --update`.
- Subagentes de extracción deben ser `general-purpose`.
- Filtrar aristas `INFERRED` por `confidence_score`.

## 8. Automejora y versiones

Bucle obligatorio al cerrar cada proyecto:

1. **Medir:** `docs/metrics.md` (horas por fase, iteraciones por gate, bugs encontrados en verify y después).
2. **Retro guiada:** ¿qué fase fue lenta?, ¿qué error se repitió?, ¿qué pregunta faltó en el intake?, ¿qué decisión de arquitectura se revirtió?
3. **Lecciones:** cada lección se clasifica:
   - **Regla** → al checklist de la fase afectada.
   - **Pregunta faltante** → a la checklist de entrevista del intake.
   - **Patrón reutilizable** → al catálogo de stack o a una plantilla.
   - **Error de proceso** → cambio en la skill/comando de la fase.
4. **Propuesta:** el agente genera un diff concreto sobre el framework (no texto vago).
5. **Gate humano:** apruebas, editas o descartas cada cambio.
6. **Eval:** antes de publicar, las skills modificadas pasan sus evals (casos de prueba con y sin el cambio, vía `skill-creator`). Si empeoran, no se publican.
7. **Versión:** commit + tag semver + entrada en `CHANGELOG.md` citando el proyecto que originó la lección.
   - PATCH: ajuste de texto/checklist. MINOR: nueva regla, plantilla o skill. MAJOR: cambio de fases o artefactos.
8. **Poda:** cada 5 proyectos se revisan reglas obsoletas; cada archivo de reglas tiene límite de tamaño.

Registro central de lecciones: `lessons/LESSONS.md` (una lección = síntoma, causa, regla nueva, proyecto origen, versión donde entró).

## 9. Catálogo de stack

Ver [`catalogo-stack.md`](catalogo-stack.md). Se decide por proyecto en la fase 2 y se registra en un ADR.

**Carga solo de lo elegido:** el framework trae todos los packs de desarrollo (reglas, skills y revisores por lenguaje/framework, la mayoría vía ECC, ver §10), pero **nada de stack se carga globalmente**. Al aprobar la arquitectura, el ADR de stack dispara la instalación en el proyecto (`.claude/skills/`, `.claude/rules/`, `.claude/agents/`) **solo** de los packs del stack elegido. Ejemplo: Python + FastAPI + LlamaIndex → instala `python`, `fastapi`, `rag-pipeline-reviewer`; nada de Rust, Swift, etc. Si el stack cambia (nuevo ADR), se reinstala.

## 10. ECC como base (upstream)

[ECC](https://github.com/affaan-m/ecc) (MIT, © Affaan Mustafa) es la base de agentes y skills de Shipwright. Análisis completo: [`investigacion/ecc.md`](investigacion/ecc.md).

### Principios de integración
1. **No se hace fork ni se instala ECC completo.** Solo se usan las piezas listadas en `vendor/ecc.manifest.json` (agentes, skills, workflows, packs de stack).
2. **La copia de ECC nunca se edita.** Vive tal cual en `vendor/ecc/`. Nuestras skills de fase la *referencian* y añaden encima nuestras reglas (EARS, gates, trazabilidad, graphify). Así cada actualización entra sin conflictos de merge.
3. **Siempre actualizado, pero a releases:** se sigue la última **release etiquetada** de ECC, no cada commit.
4. **Atribución:** `THIRD_PARTY_NOTICES.md` con la licencia MIT y la versión/commit de origen.

### Sincronización automática
Un GitHub Action en el repo de Shipwright:
1. Revisa a diario si ECC publicó una release nueva.
2. Descarga **solo** las rutas del manifiesto a `vendor/ecc/` y actualiza versión + commit en el manifiesto.
3. Ejecuta las comprobaciones (si alguna falla, **no actualiza** y abre un issue con el motivo):
   - Todas las rutas del manifiesto existen y su frontmatter es válido (detecta renombrados/eliminados upstream).
   - Nuestras skills que referencian piezas de ECC siguen resolviendo.
   - Filtro de seguridad: sin hooks nuevos, sin `npx -y` sin versión, sin URLs de red nuevas, sin llamadas `claude -p` ocultas, sin texto promocional.
   - Evals de las fases afectadas (estructurales en v1; con LLM cuando existan, ver §8).
4. Si todo pasa: commit automático `chore(ecc): sync to vX.Y.Z` + entrada en CHANGELOG + versión PATCH de Shipwright.

Los usuarios reciben la actualización con la actualización normal del plugin. SETUP muestra la versión de ECC en uso.

### Lo que se usa de ECC por fase

| Fase | Pieza ECC | Lo que añade Shipwright encima |
|---|---|---|
| Esqueleto | `skills/orch-pipeline` (tamaños + gates) | 8 fases, modos, gate por fase |
| Setup | `commands/project-init.md`, `rules/common` | Estructura de proyecto, graphify |
| Intake | `commands/prp-prd.md`, `skills/intent-driven-development` | EARS, IDs REQ/AC, entrevista con opciones, glosario |
| Architect | `agents/architect.md`, `skills/architecture-decision-records`, `skills/contract-first`, `skills/council` | arc42, MADR, C4, catálogo de stack |
| Plan | `skills/blueprint`, `agents/planner.md` | Formato `T001 [P] [US]`, complejidad, enlace tarea→AC |
| Build | `skills/tdd-workflow`, `agents/tdd-guide.md` | Subagente por tarea + worktree, graphify update |
| Verify | `workflows/orch-review.workflow.js`, `agents/code-reviewer.md`, `agents/security-reviewer.md`, `agents/e2e-runner.md` | Matriz AC→test con gate que falla |
| Ship | `skills/deployment-patterns`, `skills/docker-patterns`, `agents/doc-updater.md` | Docs desde artefactos, grafo global |
| Retro | `commands/learn-eval.md`, `scripts/lib/skill-evolution/` | Retro de proceso → cambio al framework + semver |
| Stack | `rules/<lenguaje>`, skills y revisores por framework, skills de IA (`eval-harness`, `agent-harness-construction`, `mcp-server-patterns`, `rag-pipeline-reviewer`…) | Criterios de selección, carga solo de lo elegido |

### Lo que NO se usa de ECC
GateGuard, observer de aprendizaje automático (instincts autoinyectados), hooks con `claude -p` oculto, `mcp-health-check`, configs MCP de patrocinadores, adaptadores multi-harness, `ecc2/`, instalador npm, skills de dominio ajeno al desarrollo.

**Aprendizaje:** solo retro bajo demanda con diff visible y aprobación humana (§8). Nada aprende ni se inyecta solo.

## 11. Hoja de ruta del framework

| Versión | Contenido |
|---|---|
| v0.1 | Método, investigación, catálogo de stack |
| v0.2 | Integración con ECC definida *(actual)* |
| v0.3 | Esqueleto del plugin + `vendor/ecc` + manifiesto + sync automático; `new` + `intake` funcionando |
| v0.4 | `architect` + plantillas arc42/MADR + instalación de packs de stack por proyecto |
| v0.5 | `plan` + `build` (subagente por tarea, TDD, hooks) |
| v0.6 | `verify` + `ship` |
| v0.7 | `retro` + evals de skills + versionado automático |
| v1.0 | Probado en ≥ 3 proyectos reales (≥ 1 hackatón, ≥ 1 cliente) |
| v2.0 | Orquestador con Claude Agent SDK (+ LangGraph para estado y gates) que ejecuta las fases ya probadas de forma autónoma |

Cada versión se construye y prueba paso a paso antes de pasar a la siguiente.

## 12. Fuentes del método

Qué tomamos de cada referencia (detalle en [`investigacion/`](investigacion/)):

| Referencia | Lo que tomamos |
|---|---|
| GitHub Spec Kit | Constitución con gates verificables, chequeo de consistencia, formato de tareas `T001 [P] [US1]` |
| AWS Kiro / cc-sdd | Criterios EARS, trío requirements/design/tasks |
| BMAD Method | Roles como subagentes revisores, niveles de escala (→ modos), historias autocontenidas |
| Superpowers | Entrevista de una pregunta a la vez, tareas pequeñas verificables, TDD, subagente por tarea, skills testeadas |
| GSD | Orquestador ligero + subagentes por archivos, límites de tamaño de docs |
| Taskmaster | Puntuación de complejidad y división automática |
| OpenSpec | Spec viva: cambios como deltas sobre la spec actual |
| Compound Engineering | Paso de retro que modifica el propio sistema |
| ECC | Base de agentes, skills y packs de stack (§10) |
| Agent OS | Estándares cargados solo cuando son relevantes (skills, no CLAUDE.md gigante) |
| arc42 / C4 / MADR | Formatos de arquitectura que los LLM manejan bien |
