# Método Shipwright

Cómo Shipwright lleva un encargo hasta software funcionando en producción. Versión **v0.8.0**.

## 1. Principios

1. **Método completo siempre.** Todas las fases y preguntas; lo que no aplica se marca `No aplica: <motivo>`, nunca se omite en silencio.
2. **Velocidad por paralelismo**, no por recortes.
3. **Todo tiene un para qué.** Cada decisión, tarea y test cita el objetivo al que sirve (§3).
4. **Spec antes que código.**
5. **El humano aprueba cada fase.**
6. **QA, seguridad, operación, documentación y UX independientes** de quien programa (§5).
7. **Listo = funcionando en producción**, observable, reversible y documentado.
8. **Lo no negociable es determinista:** hooks y scripts, no ruegos en un prompt.
9. **Nunca el mismo error dos veces:** cada misión mejora el framework (§9).
10. **Rigor en el proceso, simplicidad en el código** (YAGNI).

## 2. Misión

Todo empieza con `/shipwright:mission "<encargo>"`. Una única distinción, detectada sola y confirmada por el usuario:

| | Desde cero | Sobre lo existente |
|---|---|---|
| Ejemplo | App de IA en una hackatón | "Añade login con Google a nuestra app" |
| Primero | Entender el problema | Entender el sistema (graphify, convenciones), luego el problema |
| Arquitectura | Nueva | Se documenta la actual y se diseña el cambio |
| Calidad propuesta | Tiempo de entrega · fiabilidad · usabilidad | No romper nada · seguridad · consistencia con el equipo |
| Entrega típica | Producto en producción + demo | Pull request + pruebas + nota de impacto |

Además se fijan: tipo de entregable (app, funcionalidad, integración, arreglo, PoC, informe), plazo, idioma de los entregables, clase de datos, jurisdicciones, plataforma de despliegue y —si hay código existente— si se permite enviarlo a Claude. Antes de empezar, el agente explica el plan y espera confirmación. Tarjeta: [`templates/mission.md`](../templates/mission.md).

## 3. Cadena de objetivos

Misión → **O** objetivos de usuario → **KR** métricas → **QG** 3 objetivos de calidad ordenados (ISO 25010) → **QS** escenarios medibles → **TM** amenazas → **ADR** decisiones → **C** componentes → **US/AC** historias y criterios EARS → **T** tareas → tests.

- Cada elemento lleva `serves: <ID> — <cómo>`. Sin él, o con un ID inexistente, es **huérfano** y se rechaza.
- El objetivo de la arquitectura es cumplir los QG en su orden con el mínimo de piezas, demostrado por escenarios medibles. Ejemplo QS: *el jurado sube un audio de 5 min con el wifi del evento → resumen en ≤ 60 s, 5 de 5 veces*.
- `scripts/trace.mjs` lo comprueba en cada gate (`--phase intake|architect|plan|qa`): huérfanos, IDs inválidos, cobertura (todo O con KR y AC, todo QG con QS, todo AC/QS/TM con tarea, y en QA todo AC con test y todo QS/TM con evidencia). Un revisor valida además que cada justificación tenga sentido.

## 4. Fases

| # | Fase | Comando | Produce | Revisan | Gate |
|---|---|---|---|---|---|
| 1 | Mission | `/shipwright:mission` | `mission.md` borrador, plan explicado | — | Usuario confirma |
| 2 | Intake | `/shipwright:intake` | Objetivos, `requirements.md` (EARS), glosario, inventario de datos, tareas clave de usuario | analyst, qa-lead, security-lead, ux-lead | Usuario aprueba |
| 3 | Architect | `/shipwright:architect` | `ARCHITECTURE.md` (arc42, C4), ADRs, QS, modelo de amenazas, estrategia de pruebas, plan de despliegue, prototipo UX, plan de documentación | architect-reviewer y los 5 agentes de §5 | Usuario aprueba (y recorre el prototipo) |
| 4 | Plan | `/shipwright:plan` | Tareas `T001`, tests de aceptación bloqueados, plan de pruebas | qa-lead | Usuario aprueba |
| 5 | Build | `/shipwright:build` | Código + tests + docs, un subagente por tarea, un PR por tarea | reviewer, qa-lead, security-lead, ux-lead | Automático |
| 6 | QA | `/shipwright:qa` | Informes de pruebas, seguridad, documentación y UX → SHIP / NO SHIP | qa-lead, security-lead, docs-lead, ux-lead | Usuario aprueba |
| 7 | Ship | `/shipwright:ship` | Producción verificada, release con CHANGELOG, runbook, SBOM, documento de entrega | devops-lead, security-lead, docs-lead | Usuario confirma cada despliegue |
| 8 | Retro | `/shipwright:retro` | Lecciones → nueva versión del framework | — | Usuario aprueba |
| — | Cambio | `/shipwright:change` | Delta sobre spec, arquitectura, plan y amenazas | — | Usuario aprueba |
| — | Estado | `/shipwright:status` | Reporte de una pantalla para quien pidió el trabajo | — | — |

**Mission.** Clasifica el encargo, pregunta lo de §2, comprueba herramientas (git, Node, graphify), crea la tarjeta y explica el plan.

**Intake.** Si hay sistema existente: graphify + convenciones + comportamiento actual (`existing-system.md`). graphify sobre el material del cliente: sus ambigüedades se vuelven preguntas. Entrevista con la [checklist completa](../skills/intake/checklist.md) en bloques de 4 preguntas con opciones; ante "no sé", el agente investiga y vuelve con opciones y fuentes. Salida: O, KR, QG, historias y criterios EARS (incluidos los de seguridad y privacidad), nivel ASVS propuesto. La spec aprobada queda protegida.

**Architect.** QS por cada QG; stack (catálogo + ADR; en sistemas existentes, el actual); arc42 con C4 L1–L2, datos, contratos, flujos, decisiones transversales, despliegue y riesgos. En paralelo: modelo de amenazas, estrategia de pruebas (todos los tipos evaluados), plan de despliegue para la plataforma del usuario, plan de documentación y, si hay interfaz, flujos + prototipo navegable + sistema de diseño. Al aprobar se instalan los packs del stack.

**Plan.** Tareas de 2–15 min con `serves:`, rutas, verificación y complejidad (> 6 se divide). qa-lead escribe los tests de aceptación desde los EARS; quedan bloqueados (hook + huellas SHA-256) y ~1 de cada 5 queda oculto hasta QA.

**Build.** Subagente nuevo por tarea con su objetivo en la primera línea. TDD para tests internos; los de aceptación no se tocan. La documentación se actualiza en la misma tarea que el código. Tras cada tarea: revisión de código, del diff de tests (qa-lead), de dependencias nuevas y diffs sensibles (security-lead), de la interfaz contra el prototipo (ux-lead), PR con Conventional Commits y `graphify update`. Desviación de la arquitectura → `/shipwright:change`.

**QA.** Huellas intactas, tests ocultos incorporados, todos los tipos de prueba pertinentes, verificación de amenazas y nivel ASVS, exploración con IA, bugs con severidad, documentación verificada (quick start en máquina limpia, ejemplos, enlaces) y revisión UX. Criterios de salida en [`reference/qa-catalog.md`](../reference/qa-catalog.md).

**Ship.** Staging → smoke → rollback ensayado → **aprobación del usuario** → producción → canario ≥ 15 min. Checklist de producción de 14 puntos con evidencia, runbook, SBOM y firma, tag de versión con CHANGELOG, documentación final y documento de entrega.

**Retro.** §9.

## 5. Disciplinas transversales

Cinco agentes independientes de quien programa. Cada referencia detalla qué hace el agente en cada fase, sus herramientas y sus criterios de salida.

| Disciplina | Agente | Garantiza | Referencia |
|---|---|---|---|
| QA | `qa-lead` | Todas las pruebas pertinentes (40+ tipos); tests de aceptación inalterables; veredicto SHIP / NO SHIP | [`qa-catalog`](../reference/qa-catalog.md) |
| Seguridad | `security-lead` | Clase de datos y leyes aplicables, nivel ASVS, modelo de amenazas, dependencias verificadas, SBOM y firma | [`security-baseline`](../reference/security-baseline.md) |
| Producción | `devops-lead` | Despliegue en la plataforma del usuario, checklist de 14 puntos, rollback ensayado, runbook | [`deploy-catalog`](../reference/deploy-catalog.md) |
| Documentación | `docs-lead` | Repositorio que se explica solo (Diátaxis), documentación verificada, documento de entrega | [`docs-standard`](../reference/docs-standard.md) |
| UX/UI | `ux-lead` | Flujos, prototipo navegable aprobado por el usuario, sistema de diseño, accesibilidad | [`ux-standard`](../reference/ux-standard.md) |

Git del repositorio entregado: ramas cortas, Conventional Commits con `serves:`, PR con checklist, semver y CHANGELOG automático ([`git-workflow`](../reference/git-workflow.md)).

Plataformas de despliegue cubiertas: Azure, AWS, GCP, Render, Railway, Fly.io, Vercel, Netlify, Cloudflare, DigitalOcean, servidor propio/Docker, Kubernetes y tiendas móviles. **Ningún despliegue a producción, cambio de DNS o recurso de pago sin aprobación explícita del usuario.**

## 6. Gates

El agente presenta: resumen, artefactos, objetivos cubiertos, lo marcado "No aplica", riesgos. Opciones: **Aprobar / Pedir cambios / Volver**. Nunca avanza sin respuesta.

## 7. Estructura de un proyecto

```
.shipwright/state.json        fase, rutas, tests bloqueados
docs/
  mission.md                  tarjeta y objetivos (fuente de IDs)
  client/                     material original del encargo
  spec/                       requirements, glossary, existing-system
  architecture/ARCHITECTURE.md
  adr/
  security/                   threat-model, data-inventory, report
  ux/                         ux-spec, prototype/, design-tokens.json
  qa/                         test-strategy, test-plan, report, bugs/
  ops/                        deploy-plan, runbook
  handover.md                 documento de entrega
  status/                     reportes de estado
  plan/tasks.md
  changes/                    deltas aprobados
  metrics.md                  generado automáticamente
  retro.md
tests/acceptance/             bloqueados
```

En sistemas existentes, `docs/` va en `docs/shipwright/<misión>/`.

## 8. graphify

| Fase | Uso |
|---|---|
| Intake | `/graphify .` (sistema existente) y `/graphify docs/client --mode deep` (encargo) |
| Architect | `/graphify query`, `path`, `god-nodes`; grafo global y lecciones de misiones pasadas |
| Build | `graphify update .` en cada commit; `graphify affected "X"` antes de tocar un componente |
| Ship | `graphify global add` al historial |
| Retro | `graphify save-result` + `reflect` |

Sin permiso para enviar código: solo `graphify update .` (local). `query` busca texto literal: consultar en el idioma de las etiquetas.

## 9. Automejora

1. Métricas automáticas por fase (`metrics.md`): tiempos, vueltas en gates, tests fallidos, hallazgos.
2. Retro: qué fue lento, qué se repitió, qué pregunta faltó, y qué fase debió atrapar cada bug, vulnerabilidad o incidente escapado.
3. Cada lección se convierte en un cambio concreto al framework (diff), que el usuario aprueba.
4. Las skills modificadas pasan evals y la versión nueva se compara contra un banco de 3 misiones de referencia; si empeora, no se publica.
5. Commit + tag semver + CHANGELOG. Poda de reglas cada 5 misiones.

Nada aprende ni se inyecta solo.

## 10. ECC

[ECC](https://github.com/affaan-m/ecc) (MIT) aporta agentes, skills y reglas por lenguaje. Su catálogo de desarrollo (324 piezas) está en `vendor/ecc/` sin modificar y **no se carga entero**: el índice `vendor/ecc.index.md` dice qué usar en cada fase y se invoca bajo demanda ([`reference/using-ecc.md`](../reference/using-ecc.md)). Se sincroniza con cada release de ECC mediante un pull request revisado por IA y aprobado por el maintainer. Excluido por seguridad: aprendizaje automático que se autoinyecta, hooks con llamadas ocultas a Claude, MCPs de patrocinadores, GateGuard. Análisis: [`investigacion/ecc.md`](investigacion/ecc.md).

## 11. Piezas del plugin

| Qué | Dónde |
|---|---|
| Fases | `skills/<fase>/SKILL.md` |
| Agentes | `agents/analyst.md`, `qa-lead.md`, `security-lead.md`, `devops-lead.md`, `docs-lead.md`, `ux-lead.md` |
| Referencias | `reference/qa-catalog.md`, `security-baseline.md`, `deploy-catalog.md`, `docs-standard.md`, `ux-standard.md`, `git-workflow.md`, `using-ecc.md` |
| Plantillas | `templates/` |
| Scripts | `scripts/trace.mjs` (trazabilidad), `lock.mjs` (huellas), `metrics.mjs`, `ecc-sync.mjs` |
| Hooks | Protección de specs aprobadas y tests bloqueados (edición y consola); inicio de fase en métricas |
| Tests | `node --test "scripts/**/*.test.mjs"` — CI en Windows, macOS y Linux |

## Hoja de ruta

| Versión | Contenido |
|---|---|
| v0.5 | Plugin, `mission`, `intake`, trazabilidad, ECC |
| v0.6 | Disciplina QA |
| v0.7 | Seguridad obligatoria, producción en cualquier plataforma, documentación concisa |
| **v0.8** | Documentación de los repos entregados, UX/UI, flujo git, `status` *(actual)* |
| v0.9 | `architect` |
| v0.10 | `plan` + `build` + `change` |
| v0.11 | `qa` + `ship` |
| v0.12 | `retro`, evals de skills, banco de misiones |
| v1.0 | Probado en ≥ 3 misiones reales |
| v2.0 | Orquestador autónomo con Claude Agent SDK |
