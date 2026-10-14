# Método Shipwright

> Documento maestro. Define el camino completo desde "me encargan algo" hasta "entregado, documentado y con lecciones aprendidas".
> Versión del método: **v0.3.0** (solo documentación; base de agentes: ECC).

---

## 1. Objetivo

Cumplir **misiones** de software **en el menor tiempo posible**, con **calidad de código y documentación de nivel profesional**, siguiendo un **camino fijo y repetible** en lugar de prompts improvisados.

Una misión puede ser crear algo desde cero (una app en una hackatón, un MVP) o integrarse en algo que ya existe (un empleado nuevo al que le piden "añade X a nuestro sistema"). El entregable no siempre es una app: puede ser una funcionalidad, una integración, un arreglo, una prueba de concepto o un informe.

Métricas que el método optimiza y mide en cada misión (§9):

| Métrica | Qué se mide |
|---|---|
| Velocidad | Horas desde el encargo hasta la entrega, por fase |
| Calidad de software | Criterios de aceptación verificados, tests, defectos post-entrega, hallazgos de revisión |
| Calidad de documentación | Misión, spec, arquitectura y README completos y consistentes con el código |
| Sentido | % de trabajo trazado a un objetivo (meta: 100%, §4) |

## 2. Principios

1. **Una sola filosofía: lo mejor posible en el menor tiempo posible.** No hay modos; la profundidad se ajusta sola según la misión (§3).
2. **Todo tiene un para qué.** Cada decisión, tarea, commit y test cita el objetivo al que sirve. Lo que no sirve a nada se rechaza (§4).
3. **Spec antes que código.** Nada se implementa sin requisito escrito y criterio de aceptación verificable.
4. **Puertas humanas.** Al final de cada fase el humano aprueba antes de avanzar (§6).
5. **El grafo es la memoria.** `/graphify` se usa en todas las fases (§8).
6. **Contexto limpio.** El hilo principal orquesta; el trabajo pesado va en subagentes que se comunican por archivos.
7. **Lo no negociable es determinista.** Tests, lint, trazabilidad y protección de specs aprobadas se aplican con hooks y scripts, no con "por favor" en un prompt.
8. **Nunca el mismo error dos veces.** Cada misión termina en retrospectiva; cada lección aprobada cambia el framework y genera una versión nueva (§9).
9. **Lo mínimo que funciona.** YAGNI en el producto y en el propio framework.

## 3. La misión y cómo se ajusta la profundidad

Todo empieza con un comando:

```
/shipwright:mission "añade login con Google al sistema de la empresa"
```

El agente lee el encargo y el entorno, y clasifica la misión en **dos ejes**:

### Eje 1 — Tipo de misión (se detecta si hay código existente)

| | **Crear** (greenfield) | **Integrar** (brownfield) |
|---|---|---|
| Cuándo | Carpeta vacía o sin sistema previo | Hay un repositorio/sistema existente |
| Ejemplo | App de IA en una hackatón de 24 h, MVP para un cliente | Empleado: "añade login con Google a nuestro sistema" |
| Primer paso | Entender el **problema** (entrevista) | Entender el **sistema**: `/graphify` sobre el código, extraer convenciones y specs del código existente, y luego entender el problema |
| Arquitectura | Se diseña nueva + walking skeleton | Se respeta la existente; solo se documenta el cambio |
| Objetivos de calidad por defecto | 1 Tiempo hasta la demo · 2 Fiabilidad de la demo · 3 Usabilidad | 1 No romper nada (bajo radio de impacto) · 2 Seguridad · 3 Consistencia con el estilo del equipo |
| Reglas extra | Servicios gestionados antes que infraestructura propia; plan B si falla un servicio externo | Sin dependencias nuevas sin ADR; cambio detrás de feature flag si es visible; plan de rollback; `graphify affected` antes de tocar un componente |
| Entrega típica | Producto desplegado + demo | Pull request + pruebas + nota de impacto |

### Eje 2 — Tamaño y riesgo (decide cuántos pasos y cuánto detalle)

Basado en el clasificador de `orch-pipeline` de ECC. **Si la misión toca seguridad, pagos, datos personales o un contrato público, sube automáticamente un nivel.**

| | Trivial | Pequeña | Estándar | Grande |
|---|---|---|---|---|
| Ejemplo | Cambiar un texto, un bug obvio | Un endpoint, una pantalla | Una funcionalidad completa, una app de hackatón | Un sistema nuevo, varias integraciones |
| Entrevista | 0–2 preguntas | ≤ 5 | ≤ 12 | Completa |
| Objetivos | Misión + 1 objetivo | + métrica | + 3 objetivos de calidad + escenarios | Completo |
| Arquitectura | — | Nota en la tarjeta | C4 L1–L2 + ADRs clave | arc42 completo + ADR por decisión |
| Plan | Directo | Lista corta de tareas | Tareas `T001` + chequeo de consistencia | + complejidad y paralelismo |
| Tests | El del cambio | Criterios Must | Todos los criterios (TDD) | TDD + E2E + seguridad |
| Gates | 1 (al final) | 2 (plan, entrega) | Una por fase | Una por fase |

### Eje 3 — Tipo de entregable (decide cómo termina)

`app` · `funcionalidad` · `integración` · `arreglo` · `prueba de concepto` · `informe`. Un informe o una PoC no se despliegan: Ship entrega el documento o la demo, y la Definition of Done lo refleja.

### Atajos

`/shipwright:mission --preset hackathon` y `--preset client` solo rellenan la tarjeta con valores típicos (plazo corto y calidad orientada a demo; o calidad orientada a mantenimiento). No cambian el método.

### Explicación al usuario al iniciar cada misión

Antes de empezar, el agente muestra siempre un resumen como este y pide confirmación:

```
Misión: Añadir login con Google
Tipo: INTEGRAR en sistema existente (repo detectado: empresa-app, Node + Express)
Tamaño: ESTÁNDAR (sube desde "pequeña" porque toca seguridad)
Entregable: funcionalidad → pull request

Qué voy a hacer:
 1. Analizar tu sistema con graphify y extraer sus convenciones (≈5 min)
 2. Hacerte ≤12 preguntas para cerrar objetivos y criterios
 3. Proponer el cambio de arquitectura (te pido aprobación)
 4. Planificar tareas, construir con tests, verificar, entregar el PR
Prioridades de calidad: 1º no romper nada · 2º seguridad · 3º estilo del equipo

¿Correcto?  [Sí] [Cambiar tipo/tamaño] [Cambiar prioridades]
```

## 4. Cadena de objetivos (nada se construye sin un para qué)

Todo vive en `docs/mission.md` (salvo ADRs, tareas y tests, que citan sus IDs).

| # | Nivel | ID | Qué es | Fase | Formato |
|---|---|---|---|---|---|
| 0 | Misión | `M` | El encargo, en una frase | Mission | Tarjeta (abajo) |
| 1 | Objetivo de usuario/negocio | `O-n` | El cambio que el usuario consigue (JTBD + impact mapping) | Intake | `Cuando <situación>, <actor> quiere <progreso> para <resultado>` |
| 2 | Métrica de éxito | `KR-n` | Evidencia medible de que O se cumple | Intake | `<métrica>: <base> → <meta>, medido con <cómo>` |
| 3 | Objetivos de calidad | `QG-1..3` | Las 3 características (ISO 25010) que más importan, **ordenadas**; el orden decide los empates | Intake (gate) | `QG-k: <atributo> porque <O/KR>` |
| 4 | Escenario de calidad | `QS-n` | Requisito arquitectónico medible (formato ATAM) | Architect | fuente · estímulo · entorno · artefacto · respuesta · **medida** |
| 5 | Decisión | `ADR-n` | Elección entre alternativas para cumplir un QS | Architect | MADR + `serves: [QS-n]` |
| 6 | Componente | `C-n` | Pieza que implementa ADRs/historias | Architect | `C-n · responsabilidad · serves` |
| 7 | Historia / criterio | `US-nn`, `AC-nn.m` | Funcionalidad y criterio verificable | Intake | EARS + `serves: O-n` |
| 8 | Tarea | `T001` | Unidad de trabajo de un subagente | Plan | `T001 [P] [US-01] serves: AC-01.1` |
| 9 | Test | — | Evidencia de un AC o un QS | Build | nombre/docstring con el ID |

### El objetivo de la arquitectura

La arquitectura **no tiene un objetivo propio: su objetivo es cumplir los objetivos de calidad ordenados (QG), bajo las restricciones de la misión, con el mínimo de piezas.** Lo funcional casi siempre cabe en cualquier arquitectura; lo que decide su forma son los atributos de calidad.

Nunca se escribe "escalable" o "seguro". Siempre un escenario medible:

> **QS-1** (sirve a QG-1 Fiabilidad de la demo): **fuente** jurado · **estímulo** sube un audio de 5 min · **entorno** wifi del evento, en directo · **artefacto** flujo subir → resumen · **respuesta** muestra el resumen · **medida** ≤ 60 s, 5 de 5 ensayos sin error.

### Regla de trazabilidad

- **Hacia arriba:** todo ADR, componente, tarea, test y commit lleva `serves: <ID>`. Sin `serves:` o con un ID inexistente = **huérfano → rechazado**. Sale de dos formas: va a "Fuera de alcance / parking" de la tarjeta, o vuelve a Intake como cambio de alcance.
- **Hacia abajo:** todo O tiene ≥ 1 KR y ≥ 1 AC; todo QG tiene ≥ 1 QS; todo AC tiene ≥ 1 tarea y ≥ 1 test.

Cómo se aplica (barato, en tres capas):
1. **Registro:** `docs/mission.md` es la única fuente de IDs válidos.
2. **Script determinista** (`shipwright trace`, milisegundos, sin LLM): corre en el gate de Plan, en cada commit de Build y en Verify. Falla ante huérfanos, IDs inexistentes o coberturas vacías.
3. **Propósito en cada subagente:** la primera línea de su encargo es `Sirves a <ID>: <texto>`; su salida termina con `serves:` y una frase que dice cómo. El revisor de Verify pregunta además: "¿algo del diff no sirve a ningún ID?".

### Tarjeta de misión (`docs/mission.md`)

```
# Misión M: <verbo + resultado, una frase>
Entregable: app | funcionalidad | integración | arreglo | prueba de concepto | informe
Tipo: crear | integrar (<repo/sistema>, convenciones: <enlace>)
Tamaño: trivial | pequeña | estándar | grande (+ motivo)
Plazo: <fecha/hora>
Personas: quien pide · usuario final · quien aprueba · quien mantiene

Objetivos:            O-1 Cuando …, <actor> quiere … para …
Métricas:             KR-1 <métrica: base → meta, cómo se mide>
Calidad (ordenada):   QG-1 … · QG-2 … · QG-3 …
Restricciones:        tecnología impuesta, presupuesto, compliance, "no tocar X"
Definition of Done:   KR medidos + AC Must verificados + QS-1 demostrado + <docs/PR/demo>
Fuera de alcance / parking: …
Suposiciones abiertas: …
```

### Ejemplos

**A — Crear (hackatón, 24 h): "app de IA que resume reuniones"**
- M: demo ganadora de un resumidor de reuniones · entregable app (demo) · tamaño estándar.
- O-1: cuando sale de una reunión, un asistente quiere un resumen con acciones para no repasar la grabación.
- KR-1: resumen de un audio de 5 min en ≤ 60 s · KR-2: el jurado puntúa la utilidad ≥ 4/5.
- QG: 1 Tiempo hasta la demo · 2 Fiabilidad de la demo · 3 Usabilidad.
- QS-1: el de arriba · QS-2: si la API falla, se muestra un resumen precargado en ≤ 2 s.
- ADR-1 (serves QS-1): transcripción + LLM gestionados, sin colas propias · ADR-2 (serves QS-2): plan B con ejemplo grabado.
- Huérfano rechazado: "login de usuarios" → parking.

**B — Integrar (empleado): "login con Google en el sistema existente"**
- M: los usuarios entran con Google · entregable funcionalidad (PR) · tamaño estándar (sube por seguridad).
- O-1: el empleado entra sin crear otra contraseña · KR-1: login funcional en staging y 0 tests existentes rotos.
- QG: 1 Seguridad · 2 No romper nada · 3 Estilo del equipo.
- QS-1: alguien manipula `state` en el callback → 4xx y no se crea sesión (100%) · QS-2: desplegado con el flag apagado → 0 cambios en flujos actuales · QS-3: sin patrones ni dependencias nuevas sin ADR.
- ADR-1 (QS-3): extender la estrategia de auth existente · ADR-2 (QS-2): feature flag + rollback · ADR-3 (QS-1): vincular cuentas por email verificado.
- Huérfano rechazado: "refactor del módulo de sesiones" → parking.

## 5. Pipeline

```
 encargo
    │
 [0] MISSION ─► [1] INTAKE ─► [2] ARCHITECT ─► [3] PLAN ─► [4] BUILD ─► [5] VERIFY ─► [6] SHIP ─► [7] RETRO
       ▲ confirma    ▲ gate        ▲ gate          ▲ gate      (por tarea)    ▲ gate       ▲ gate       │
       └──────────────── cambios de alcance vuelven a INTAKE ───────────────────────────────────────────┘
                                                                     lecciones ─► nueva versión del framework
```

Las fases y gates que se ejecutan dependen del tamaño (§3). En misiones triviales, Intake/Architect/Plan se reducen a la tarjeta.

| # | Fase | Comando | Artefactos de salida | Gate |
|---|---|---|---|---|
| 0 | Mission | `/shipwright:mission` | `docs/mission.md` (borrador), clasificación, explicación al usuario | Usuario confirma tipo/tamaño/prioridades |
| 1 | Intake | `/shipwright:intake` | `mission.md` completa (O, KR, QG), `docs/spec/requirements.md`, glosario, grafo | Humano aprueba |
| 2 | Architect | `/shipwright:architect` | `docs/architecture/ARCHITECTURE.md`, `docs/adr/`, QS, componentes | Humano aprueba |
| 3 | Plan | `/shipwright:plan` | `docs/plan/tasks.md` | Humano aprueba |
| 4 | Build | `/shipwright:build` | código + tests, grafo actualizado | Automático (hooks + trace) |
| 5 | Verify | `/shipwright:verify` | `docs/verify/report.md` | Humano aprueba |
| 6 | Ship | `/shipwright:ship` | entrega según tipo (deploy, PR, demo, informe), README, CHANGELOG | Humano confirma |
| 7 | Retro | `/shipwright:retro` | `docs/retro.md`, propuestas de cambio al framework | Humano aprueba cambios |

### Fase 0 — Mission
- Lee el encargo; detecta si hay sistema existente (tipo), estima tamaño y riesgo, y propone el tipo de entregable.
- Crea `docs/mission.md` en borrador y, si es **crear**, el repo del proyecto en su propia carpeta.
- Comprueba herramientas: git, graphify (`graphify --help`), runtime del lenguaje.
- Muestra la explicación al usuario (§3) y espera confirmación.

### Fase 1 — Intake (entender el problema y, si aplica, el sistema)
1. **Solo integrar — entender el sistema:** `/graphify .` sobre el repo; extraer convenciones (agente `code-architect` de ECC) y specs del comportamiento existente (agente `spec-miner` de ECC). Resultado: `docs/spec/existing-system.md`.
2. **Ingesta del encargo:** documentos en `docs/client/` → `/graphify docs/client --mode deep`. Las aristas `AMBIGUOUS` se convierten en preguntas.
3. **Entrevista interactiva** (AskUserQuestion, opciones múltiples, una pregunta por tema, siempre con opción recomendada). Cobertura obligatoria, recortada según tamaño: objetivo y para quién, métrica de éxito, prioridades de calidad, flujos principales, datos, integraciones, no funcionales, plataforma, plazo, restricciones. Lo no resuelto queda como **suposición explícita**.
4. **Salida:** tarjeta de misión completa (O, KR, QG ordenados, DoD, parking) + `requirements.md` con historias `US-NN` (MoSCoW), criterios **EARS** `AC-NN.M` con `serves: O-n`, no funcionales medibles, fuera de alcance, suposiciones, preguntas abiertas.
5. **Revisión** por subagente *analyst*: contradicciones, huecos, criterios no verificables, objetivos sin métrica.
6. **Gate.** La spec aprobada queda protegida por hook.

### Fase 2 — Architect
1. Contexto: `/graphify query` sobre el grafo de requisitos (y del sistema existente si es integrar); grafo global y `LESSONS.md` de misiones pasadas.
2. Por cada QG, escribir sus **escenarios QS** medibles.
3. Stack (solo crear) con `docs/catalogo-stack.md`, registrado en ADR. Integrar: se usa el stack existente; cualquier dependencia nueva requiere ADR.
4. `ARCHITECTURE.md` (arc42 reducido, profundidad según tamaño): objetivos y restricciones (QG + QS), contexto C4 L1, contenedores C4 L2, modelo de datos, contratos/API, flujos clave, decisiones transversales, riesgos, matriz `QS/US → componente`. Lo desconocido se marca `TBD`.
5. **ADRs MADR**, cada uno con `serves: [QS-n]`.
6. Revisión: *architect-reviewer* (¿cada QS está cubierto? ¿sobra alguna pieza?) y *security-reviewer*.
7. **Gate.** Al aprobar, se instalan en el proyecto solo los packs del stack (§10).

### Fase 3 — Plan
- Tareas de 2–15 min de agente: `T001 [P] [US-NN] serves: AC/QS`, rutas, paso de verificación, complejidad 1–10 (> 6 se divide).
- Orden: walking skeleton primero (solo crear), luego verticales por prioridad.
- `shipwright trace`: todo AC/QS con tarea; toda tarea con `serves` válido.
- **Gate.**

### Fase 4 — Build
- Un subagente nuevo por tarea, con `Sirves a <ID>` como primera línea y la tarea autocontenida.
- TDD: test del criterio primero (rojo) → implementación mínima (verde) → refactor.
- Tareas `[P]` en paralelo con git worktrees.
- Hooks: tests + lint + typecheck (una vez por turno), protección de spec aprobada, `shipwright trace` en cada commit (mensaje con `serves:`).
- Tras cada tarea: revisión breve, commit, `graphify update .`.
- Desviación de la arquitectura → ADR nuevo antes de seguir.

### Fase 5 — Verify
- Matriz `O → KR → AC → test → estado` y `QG → QS → evidencia`. Un AC sin test o un QS sin evidencia = fallo.
- Revisiones paralelas (workflow `orch-review` de ECC): correctitud, seguridad, sobreingeniería, documentación vs código, trabajo huérfano.
- E2E de los flujos críticos. Integrar: suite existente completa en verde.
- `report.md`: veredicto por requisito (verified / partial / failed) y Definition of Done.
- **Gate.**

### Fase 6 — Ship
Según el entregable: deploy, pull request con nota de impacto y rollback, demo grabada, o informe. Docs finales (README, CHANGELOG). Grafo final al historial global (`graphify global add`). **Gate:** el humano confirma antes de desplegar o publicar.

### Fase 7 — Retro
Ver §9.

## 6. Puertas (gates)

En cada gate el agente presenta: resumen de 5 líneas, artefacto generado, objetivos que cubre, riesgos y suposiciones, y pregunta con opciones: **Aprobar / Pedir cambios / Volver a fase anterior**. Nunca avanza sin respuesta explícita.

## 7. Estructura de un proyecto

```
mi-proyecto/
├── CLAUDE.md                  # contexto mínimo + enlace a mission.md
├── docs/
│   ├── mission.md             # tarjeta de misión + cadena de objetivos (fuente de IDs)
│   ├── client/                # material original del encargo (inmutable)
│   ├── spec/requirements.md
│   ├── spec/existing-system.md   # solo integrar
│   ├── spec/glossary.md
│   ├── architecture/ARCHITECTURE.md
│   ├── adr/0001-*.md
│   ├── plan/tasks.md
│   ├── verify/report.md
│   ├── metrics.md
│   └── retro.md
├── graphify-out/
├── src/ …
└── tests/ …
```

En misiones de **integrar**, `docs/` se crea dentro del repo existente en una carpeta propia (por defecto `docs/shipwright/<misión>/`) para no mezclarse con la documentación del equipo.

## 8. Uso de graphify en cada fase

| Fase | Comando | Para qué |
|---|---|---|
| Intake (integrar) | `/graphify .` | Mapa del sistema existente: módulos centrales, dependencias |
| Intake | `/graphify docs/client --mode deep` | Entidades, módulos y ambigüedades del encargo |
| Intake | `/graphify add <url>` | Añadir referencias web |
| Architect | `/graphify query`, `/graphify path "A" "B"`, `graphify god-nodes` | Agrupar requisitos en componentes, ver dependencias |
| Architect | grafo global + `LESSONS.md` | Reutilizar soluciones y evitar errores pasados |
| Build | `graphify hook install` / `graphify update .` | Grafo de código al día (AST, sin coste) |
| Build (integrar) | `graphify affected "X" --depth 2` | Radio de impacto antes de tocar un componente |
| Ship | `/graphify . --update` + `graphify global add` | Grafo final al historial global |
| Retro | `graphify save-result` + `graphify reflect` | Qué funcionó / qué no → `LESSONS.md` |

Gotchas: `query` busca subcadenas literales (consultar en el idioma de las etiquetas); hook y `--watch` solo actualizan código; subagentes de extracción `general-purpose`; filtrar `INFERRED` por confianza.

## 9. Automejora y versiones

Bucle obligatorio al cerrar cada misión:

1. **Medir:** `docs/metrics.md` (horas por fase, iteraciones por gate, bugs en verify y después, trabajo huérfano detectado).
2. **Retro guiada:** ¿qué fase fue lenta?, ¿qué error se repitió?, ¿qué pregunta faltó?, ¿la clasificación de tipo/tamaño fue correcta?, ¿qué decisión se revirtió?
3. **Lecciones**, clasificadas: regla (checklist de fase) · pregunta faltante (entrevista) · patrón reutilizable (catálogo/plantilla) · error de proceso (skill/comando) · mala clasificación (umbrales de tamaño).
4. **Propuesta:** diff concreto sobre el framework (patrón `learn-eval` de ECC: contenido de la sesión tratado como no confiable, diff visible).
5. **Gate humano:** aprobar, editar o descartar cada cambio.
6. **Eval:** las skills modificadas pasan sus evals (`skill-comply` de ECC / `skill-creator`). Si empeoran, no se publican.
7. **Versión:** commit + tag semver + CHANGELOG citando la misión de origen. PATCH texto/checklist · MINOR regla/plantilla/skill · MAJOR fases o artefactos.
8. **Poda:** cada 5 misiones se revisan reglas obsoletas; límite de tamaño por archivo de reglas.

Nada aprende ni se inyecta solo: solo retro bajo demanda con aprobación humana. Registro central: `lessons/LESSONS.md`.

## 10. Catálogo de stack y packs

Ver [`catalogo-stack.md`](catalogo-stack.md). En misiones de **crear** se decide en Architect y se registra en un ADR; en misiones de **integrar** se detecta del sistema existente.

**Carga solo de lo elegido:** el framework trae todos los packs de desarrollo (reglas, skills y revisores por lenguaje/framework, en su mayoría de ECC), pero **nada de stack se carga globalmente**. Tras el gate de Architect se instalan en el proyecto (`.claude/skills/`, `.claude/rules/`, `.claude/agents/`) **solo** los packs del stack. Ejemplo: Python + FastAPI + LlamaIndex → `python`, `fastapi`, `rag-pipeline-reviewer`. Si el stack cambia (nuevo ADR), se reinstala.

## 11. ECC como base (upstream)

[ECC](https://github.com/affaan-m/ecc) (MIT, © Affaan Mustafa) es la base de agentes y skills. Análisis: [`investigacion/ecc.md`](investigacion/ecc.md).

### Principios de integración
1. **Ni fork ni ECC completo.** Solo las piezas listadas en `vendor/ecc.manifest.json`.
2. **La copia de ECC nunca se edita.** Vive tal cual en `vendor/ecc/`; nuestras skills la referencian y añaden encima nuestras reglas (misión, objetivos, `serves`, EARS, gates, graphify). Cada actualización entra sin conflictos.
3. **Siempre actualizado a releases** de ECC, no a cada commit.
4. **Atribución** en `THIRD_PARTY_NOTICES.md`.

### Sincronización automática
GitHub Action diario en el repo de Shipwright:
1. Detecta release nueva de ECC.
2. Descarga **solo** las rutas del manifiesto a `vendor/ecc/` y actualiza versión + commit.
3. Comprueba (si algo falla, **no actualiza** y abre un issue):
   - Rutas existen y frontmatter válido (detecta renombrados/eliminados).
   - Nuestras referencias a piezas de ECC siguen resolviendo.
   - Filtro de seguridad: sin hooks nuevos, sin `npx -y` sin versión, sin URLs de red nuevas, sin `claude -p` oculto, sin texto promocional.
   - Evals de las fases afectadas.
4. Si pasa: commit `chore(ecc): sync to vX.Y.Z` + CHANGELOG + PATCH de Shipwright.

### Piezas de ECC por fase

| Fase | Pieza ECC | Lo que añade Shipwright |
|---|---|---|
| Esqueleto | `skills/orch-pipeline` (tamaños + gates) | Misión, tipos, 8 fases, cadena de objetivos |
| Mission | `commands/project-init.md` | Clasificación tipo/tamaño/entregable, explicación al usuario |
| Intake | `commands/prp-prd.md`, `skills/intent-driven-development`, `agents/spec-miner.md` (integrar), `agents/code-architect.md` (integrar) | O/KR/QG, EARS, IDs, entrevista con opciones, graphify |
| Architect | `agents/architect.md`, `skills/architecture-decision-records`, `skills/contract-first`, `skills/council` | QS medibles, arc42, MADR + `serves`, C4, catálogo |
| Plan | `skills/blueprint`, `agents/planner.md` | `T001 [P] serves:`, complejidad, `shipwright trace` |
| Build | `skills/tdd-workflow`, `agents/tdd-guide.md` | Subagente por tarea con propósito, worktrees, graphify |
| Verify | `workflows/orch-review.workflow.js`, `agents/code-reviewer.md`, `agents/security-reviewer.md`, `agents/e2e-runner.md` | Matriz O→KR→AC→test, QS→evidencia, huérfanos |
| Ship | `skills/deployment-patterns`, `skills/docker-patterns`, `agents/doc-updater.md` | Entrega según tipo, grafo global |
| Retro | `commands/learn-eval.md`, `scripts/lib/skill-evolution/` | Retro de proceso → cambio al framework + semver |
| Stack | `rules/<lenguaje>`, skills y revisores por framework, skills de IA | Criterios de selección, carga por proyecto |

**No se usa:** GateGuard, observer de aprendizaje automático, hooks con `claude -p` oculto, `mcp-health-check`, MCPs de patrocinadores, adaptadores multi-harness, `ecc2/`, instalador npm, skills de dominio ajeno.

## 12. Hoja de ruta

| Versión | Contenido |
|---|---|
| v0.1 | Método, investigación, catálogo de stack |
| v0.2 | Integración con ECC |
| v0.3 | Misiones (crear/integrar), tamaño automático, cadena de objetivos *(actual)* |
| v0.4 | Esqueleto del plugin + `vendor/ecc` + sync automático; `mission` + `intake` funcionando; `shipwright trace` |
| v0.5 | `architect` + plantillas arc42/MADR/QS + packs de stack por proyecto |
| v0.6 | `plan` + `build` (subagente por tarea, TDD, hooks) |
| v0.7 | `verify` + `ship` |
| v0.8 | `retro` + evals de skills + versionado automático |
| v1.0 | Probado en ≥ 3 misiones reales (≥ 1 crear, ≥ 1 integrar) |
| v2.0 | Orquestador con Claude Agent SDK (+ LangGraph para estado y gates) que ejecuta las fases ya probadas |

## 13. Fuentes del método

Detalle en [`investigacion/`](investigacion/).

| Referencia | Lo que tomamos |
|---|---|
| ECC | Base de agentes, skills, packs de stack, clasificador de tamaño (§11) |
| GitHub Spec Kit | Constitución con gates verificables, chequeo de consistencia, formato de tareas |
| AWS Kiro / cc-sdd | Criterios EARS, trío requirements/design/tasks |
| BMAD Method | Roles como subagentes revisores, escala por tamaño, historias autocontenidas |
| Superpowers | Una pregunta a la vez, tareas pequeñas verificables, TDD, subagente por tarea |
| GSD | Orquestador ligero + subagentes por archivos, límites de tamaño |
| Taskmaster | Complejidad y división automática |
| OpenSpec | Spec viva con deltas (base de las misiones de integrar) |
| Compound Engineering | Retro que modifica el propio sistema |
| Agent OS | Estándares cargados solo cuando son relevantes |
| arc42 / C4 / MADR | Formatos de arquitectura; objetivos de calidad ordenados (arc42 §1.2) |
| ISO 25010 / ATAM | Atributos de calidad y escenarios medibles (QG, QS) |
| JTBD / Impact mapping / OKR | Objetivos de usuario y métricas de éxito (O, KR) |
