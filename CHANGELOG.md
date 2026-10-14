# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado: semver (ver `docs/METODO.md` §9).
Cada entrada originada por una retro cita el proyecto de origen.

## [0.13.0] - 2026-10-14
### Añadido
- `reference/engineering-principles.md`: principios para todos los agentes, adaptados de andrej-karpathy-skills (pensar antes de actuar, cambios quirúrgicos), ponytail (lo mínimo que funciona, sin recortar tests ni seguridad), superpowers (evidencia antes de afirmar, depuración por causa raíz) y caveman (reportes breves solo entre agentes; preguntas y documentos en prosa clara).
- `vendor/superpowers/`: `systematic-debugging` y `verification-before-completion` (MIT), usados por el builder y en el ciclo de corrección de QA.
- Modelo por rol en cada agente (Opus: analyst, architecture-reviewer, security-lead, qa-lead; Sonnet: builder, devops-lead, docs-lead, ux-lead; Haiku: status), sobreescribible con variables de entorno.
- Hook `SessionStart` (inicio, `/clear`, `/compact`, reanudar) que restaura misión, fase y siguiente comando; cada fase recomienda `/clear` al cerrar y `/compact` si se alarga.
- Revisiones integradas de Claude Code: `/code-review` y `/security-review` en QA, `/simplify` al final de Build.
- `reference/companions.md`: complementos opcionales recomendados.

## [0.12.0] - 2026-10-14
### Añadido
- `/shipwright:retro`: evidencia (métricas, puntuación, bugs, incidentes, cambios), análisis de qué fase debió atrapar cada defecto escapado, retrospectiva guiada, lecciones convertidas en diffs concretos al framework, aplicación con aprobación en un clon local de Shipwright con tests, evals, comparación contra el banco y nueva versión; memoria con graphify.
- Banco de 3 misiones de referencia (`benchmarks/`): app de IA desde cero, API con datos y roles desde cero, y cambio sobre un repo existente con tests.
- `scripts/bench.mjs`: puntúa una misión terminada y compara dos versiones (sale con error si algo empeora).

## [0.11.0] - 2026-10-14
### Añadido
- `/shipwright:qa`: despliegue a staging, verificación de tests bloqueados, incorporación de los tests ocultos, todos los tipos de prueba pertinentes, informe de seguridad, verificación de documentación y de interfaz, ciclo de corrección con builders, trazabilidad `--phase qa` y veredicto SHIP / NO SHIP.
- `/shipwright:ship`: preparación de la release (versión, CHANGELOG, SBOM, firma, runbook, documentación, documento de entrega), checklist de producción, despliegue solo con aprobación, canario con rollback inmediato; PR para sistemas existentes; entrega de informe o PoC.
- `lock.mjs holdout`: incorpora los tests ocultos a la ruta bloqueada y registra su huella.
### Cambiado
- `devops-lead`: staging en QA (B1), preparación y producción en Ship (B2).
### Corregido
- La descripción de `devops-lead` tenía YAML inválido: el agente cargaba sin descripción desde la v0.7.

## [0.10.0] - 2026-10-14
### Añadido
- `/shipwright:plan`: tareas pequeñas trazadas (incluidas mitigaciones de amenazas, infraestructura, documentación e interfaz), tests de aceptación escritos por qa-lead, bloqueados y con huella, conjunto oculto (holdout) fuera del repo, plan de pruebas.
- `/shipwright:build`: un subagente `builder` por tarea (en paralelo con worktrees aislados), revisiones de código, integridad de tests, seguridad e interfaz antes de integrar; reanudable; las desviaciones se detienen y pasan por `change`.
- `/shipwright:change`: delta, análisis de impacto, aprobación y apertura controlada de exactamente los archivos afectados (`scripts/change.mjs`).
- `scripts/state.mjs`: único escritor de `.shipwright/state.json`.
### Cambiado
- El hook bloquea siempre `.shipwright/` (estado y huellas), para que nadie pueda quitar el bloqueo de los tests editando el estado.
- El hook solo actúa en proyectos con misión activa (`.shipwright/state.json`); nunca interfiere en otros repos.

## [0.9.0] - 2026-10-14
### Añadido
- `/shipwright:architect`: escenarios de calidad medibles confirmados con el usuario, stack y ADRs, `ARCHITECTURE.md` (arc42 + C4), y en paralelo modelo de amenazas, estrategia de pruebas, plan de despliegue, plan de documentación y prototipo navegable. Gate con recorrido del prototipo; al aprobar instala los packs del stack.
- Agente `architecture-reviewer`; plantillas `architecture.md` y `adr.md` (MADR con `serves:`).
- `scripts/install-packs.mjs`: instala en el proyecto solo las reglas, skills y agentes de ECC del stack elegido.
### Cambiado
- Los ADR aceptados quedan protegidos igual que los artefactos aprobados; un ADR puede servir a una amenaza (`TM-n`).

## [0.8.0] - 2026-10-14
### Añadido
- **Documentación de los repositorios entregados** con agente `docs-lead`: estándar Diátaxis por tipo de proyecto, documentación verificada en QA (quick start en máquina limpia, ejemplos ejecutables, enlaces, desfase con el código), sitio de docs solo con usuarios externos, documento de entrega.
- **UX/UI** con agente `ux-lead`: tareas clave, flujos, estados de cada pantalla, prototipo navegable aprobado por el usuario, sistema de diseño, revisión heurística.
- **Flujo git** de los repos entregados: ramas cortas, Conventional Commits con `serves:`, plantilla de PR, semver, CHANGELOG automático.
- `/shipwright:status`: reporte de una pantalla para quien pidió el trabajo.
### Cambiado
- §5 de `METODO.md` resumido en una tabla de cinco disciplinas; el detalle por fase vive en cada referencia.

## [0.7.0] - 2026-10-14
### Añadido
- **Seguridad obligatoria** con agente independiente `security-lead`: clase de datos y jurisdicciones (Mission), requisitos EARS y nivel ASVS (Intake), modelo de amenazas STRIDE + LLM/agentes (Architect), verificación de dependencias contra paquetes inventados por IA (Build), informe ASVS (QA), SBOM y firma (Ship). Referencia `reference/security-baseline.md`; plantillas de modelo de amenazas e informe de seguridad.
- **Producción en cualquier plataforma** con agente `devops-lead`: Azure, AWS, GCP, Render, Railway, Fly.io, Vercel, Netlify, Cloudflare, DigitalOcean, servidor propio, Kubernetes, tiendas móviles. Checklist de producción de 14 puntos, plan de despliegue y runbook. Ningún despliegue a producción sin aprobación del usuario.
- Trazabilidad de amenazas (`TM-n`): mitigación en Plan, evidencia en QA, "Riesgo aceptado" como excepción explícita.
### Cambiado
- README y `METODO.md` reescritos: más cortos y directos (METODO de ~460 a ~160 líneas).
- El índice de ECC ya no lista piezas pendientes de release.

## [0.6.0] - 2026-10-14
### Añadido
- Disciplina **QA** transversal con agente independiente `qa-lead`: testabilidad en Intake, estrategia de pruebas en Architect, tests de aceptación desde EARS en Plan, revisión del diff de tests en Build, fase QA completa con veredicto SHIP / NO SHIP, smoke y canario en Ship, análisis de bugs escapados en Retro.
- `reference/qa-catalog.md`: más de 40 tipos de prueba (funcionales, no funcionales con carga, estrés, pico, soak y escalabilidad, seguridad, accesibilidad, IA) con regla de pertinencia, herramientas por stack y criterio de salida; políticas de integridad, flaky, bugs y salida de release.
- Plantillas: estrategia de pruebas, informe de cierre (ISO 29119-3), reporte de bug.
- Tests de aceptación bloqueados: `lockedPaths` + hook que bloquea edición y escritura por consola + `scripts/lock.mjs` (huellas SHA-256).
- `shipwright trace --phase qa`: todo AC con un test que lo cite, todo QS con evidencia.
### Cambiado
- La fase VERIFY pasa a llamarse **QA** (`/shipwright:qa`).

## [0.5.0] - 2026-10-13
### Añadido
- Plugin instalable de Claude Code (`.claude-plugin/plugin.json` + marketplace).
- `/shipwright:mission`: clasificación desde cero / sobre lo existente, confidencialidad, comprobación de herramientas, tarjeta de misión y explicación al usuario.
- `/shipwright:intake`: análisis del sistema y del material con graphify, checklist de entrevista completa (15 secciones), investigación de respuestas "no sé", objetivos y requisitos EARS trazados, revisión por el agente `analyst` y gate.
- Plantillas: misión, requisitos, sistema existente, glosario.
- `scripts/trace.mjs` (trazabilidad por fase), `scripts/metrics.mjs` + hook de inicio de fase, hook que protege artefactos aprobados.
- ECC v2.2.3 vendorizado: 324 piezas (16 pendientes de release), índice por fase, `reference/using-ecc.md`.
- `scripts/ecc-sync.mjs` + workflow diario con PR y revisión por IA; CI con tests en Windows, macOS y Linux.

## [0.4.0] - 2026-10-13
### Cambiado
- **Un solo método, siempre completo**: se eliminan tamaños, presets y recortes. Todas las fases, gates, preguntas y artefactos siempre; lo que no aplica se marca `No aplica: <motivo>`.
- Única distinción: desde cero / sobre lo existente.
- ECC: todo el catálogo de desarrollo, cargado bajo demanda mediante un índice de herramientas por fase (antes: solo 15–20 piezas).
- Sincronización de ECC: rama + revisión por IA + pull request con merge humano (antes: merge automático).
### Añadido
- Checklist de entrevista completa y respuesta "no sé" con investigación y fuentes.
- `/shipwright:change` (cambios como delta) y `/shipwright:status`.
- Pregunta de confidencialidad antes de analizar código existente; idioma de entregables.
- Revisión semántica de `serves:` además del script.
- Registro automático de métricas y banco de misiones de referencia para medir cada versión.
- Requisitos técnicos (hooks solo Node; instalación de rules).

## [0.3.0] - 2026-10-13
### Cambiado
- Los modos `hackathon`/`client` se reemplazan por **misiones**: una sola filosofía ("lo mejor posible en el menor tiempo posible") con profundidad automática según tipo (crear / integrar), tamaño y riesgo, y tipo de entregable. `hackathon` y `client` quedan como presets.
- La fase SETUP pasa a ser MISSION (`/shipwright:mission`), con explicación al usuario y confirmación.
### Añadido
- Cadena de objetivos (misión → O → KR → QG → QS → ADR → componente → historia/AC → tarea → test) con `serves:` obligatorio y rechazo de trabajo huérfano (`shipwright trace`).
- Objetivo de la arquitectura definido como cumplir los objetivos de calidad ordenados mediante escenarios medibles.
- Tarjeta de misión `docs/mission.md` y ejemplos crear/integrar.

## [0.2.0] - 2026-10-13
### Añadido
- ECC (affaan-m/ecc, MIT) como base de agentes y skills: integración por piezas sin editar (`vendor/ecc/`), sincronización automática a cada release con comprobaciones de seguridad y evals (`docs/METODO.md` §10).
- Packs de stack: solo se instalan en el proyecto los del stack elegido en ARCHITECT (§9).
- Análisis de ECC (`docs/investigacion/ecc.md`) y `THIRD_PARTY_NOTICES.md`.
### Cambiado
- Hoja de ruta reordenada (§11).

## [0.1.0] - 2026-10-13
### Añadido
- Documento maestro del método (`docs/METODO.md`): 8 fases, gates, modos hackathon/client, uso de graphify, bucle de automejora, hoja de ruta.
- Catálogo de stack (`docs/catalogo-stack.md`).
- Investigación de base: frameworks de agentes, metodologías spec-driven, graphify.
