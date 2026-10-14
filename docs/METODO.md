# Método Shipwright

> Documento maestro. Define el camino completo desde "me encargan algo" hasta "entregado, documentado y con lecciones aprendidas".
> Versión del método: **v0.4.0** (solo documentación; base de agentes: ECC).

---

## 1. Objetivo

Cumplir **misiones** de software **en el menor tiempo posible**, con **calidad de código y documentación de nivel profesional**, siguiendo un **camino fijo, completo y repetible** en lugar de prompts improvisados.

Una misión puede partir **desde cero** (una app en una hackatón, un MVP) o **sobre algo que ya existe** (un empleado nuevo al que le piden "añade X a nuestro sistema"). El entregable no siempre es una app: puede ser una funcionalidad, una integración, un arreglo, una prueba de concepto o un informe.

Métricas que el método optimiza y mide en cada misión (§9):

| Métrica | Qué se mide |
|---|---|
| Velocidad | Horas desde el encargo hasta la entrega, por fase (registro automático) |
| Calidad de software | Criterios de aceptación verificados, tests, defectos post-entrega, hallazgos de revisión |
| Calidad de documentación | Misión, spec, arquitectura y README completos y consistentes con el código |
| Sentido | % de trabajo trazado a un objetivo con justificación válida (meta: 100%, §4) |

## 2. Principios

1. **Un solo método, siempre completo.** Lo mejor posible en el menor tiempo posible, sin recortes: todas las fases, todas las preguntas, todos los artefactos. Lo que de verdad no aplica se marca `No aplica: <motivo>` y el humano lo ve; **nada se omite en silencio**.
2. **Velocidad por paralelismo, no por recortes.** El tiempo se gana con subagentes en paralelo, preguntas agrupadas y plantillas, nunca saltándose pasos.
3. **Todo tiene un para qué.** Cada decisión, tarea, commit y test cita el objetivo al que sirve, con una justificación que un revisor valida. Lo que no sirve a nada se rechaza (§4).
4. **Spec antes que código.** Nada se implementa sin requisito escrito y criterio de aceptación verificable.
5. **Puertas humanas.** Al final de cada fase el humano aprueba antes de avanzar (§6).
6. **El grafo es la memoria.** `/graphify` se usa en todas las fases (§8).
7. **Contexto limpio.** El hilo principal orquesta; el trabajo pesado va en subagentes que se comunican por archivos. Las herramientas se cargan solo cuando se usan.
8. **Lo no negociable es determinista.** Tests, lint, trazabilidad, métricas y protección de specs aprobadas se aplican con hooks y scripts, no con "por favor" en un prompt.
9. **Nunca el mismo error dos veces.** Cada misión termina en retrospectiva; cada lección aprobada cambia el framework y genera una versión nueva, medida contra misiones de referencia (§9).
10. **Lo mínimo que funciona en el producto.** Rigor total en el proceso no significa sobreingeniería en el código: YAGNI en lo que se construye.

## 3. La misión

Todo empieza con un comando:

```
/shipwright:mission "añade login con Google al sistema de la empresa"
```

### Única distinción: desde cero o sobre lo existente

Se detecta sola (¿hay código o sistema existente?) y el usuario la confirma. **Ambas recorren el método completo**; lo único que cambia es qué se hace primero y qué se protege.

| | **Desde cero** | **Sobre lo existente** |
|---|---|---|
| Ejemplo | App de IA en una hackatón de 24 h, MVP para un cliente | Empleado: "añade login con Google a nuestro sistema" |
| Primer paso | Entender el **problema** | Entender el **sistema** (graphify, convenciones, comportamiento actual) y luego el problema |
| Arquitectura | Se diseña nueva + walking skeleton | Se documenta la existente y se diseña el cambio sobre ella |
| Objetivos de calidad propuestos | 1 Tiempo hasta la entrega · 2 Fiabilidad · 3 Usabilidad | 1 No romper nada · 2 Seguridad · 3 Consistencia con el equipo |
| Reglas extra | Servicios gestionados antes que infraestructura propia; plan B si falla un servicio externo | Sin dependencias nuevas sin ADR; feature flag si el cambio es visible; plan de rollback; `graphify affected` antes de tocar un componente; confidencialidad (§3.3) |
| Entrega típica | Producto desplegado + demo | Pull request + pruebas + nota de impacto |

Los objetivos de calidad son una **propuesta** que se discute en la entrevista; el usuario decide el orden final.

### 3.1 Tipo de entregable

`app` · `funcionalidad` · `integración` · `arreglo` · `prueba de concepto` · `informe`. Es un dato de la misión, no un modo: solo cambia qué produce Ship (deploy, PR, demo o documento) y la Definition of Done.

### 3.2 Explicación al usuario al iniciar

Antes de empezar, el agente muestra siempre un resumen y pide confirmación:

```
Misión: Añadir login con Google
Punto de partida: SOBRE LO EXISTENTE (repo detectado: empresa-app, Node + Express)
Entregable: funcionalidad → pull request

Qué voy a hacer (método completo, con tu aprobación al final de cada fase):
 1. MISSION    Confirmar este resumen y la confidencialidad del código
 2. INTAKE     Analizar tu sistema con graphify y extraer sus convenciones;
               entrevistarte con la checklist completa (≈ 30–40 preguntas en bloques de 4)
 3. ARCHITECT  Documentar la arquitectura actual y diseñar el cambio
 4. PLAN       Dividir en tareas trazadas a los objetivos
 5. BUILD      Construir con tests primero, una tarea por subagente
 6. VERIFY     Comprobar cada criterio con su test, revisiones de seguridad y calidad
 7. SHIP       Abrir el PR con nota de impacto y rollback
 8. RETRO      Extraer lecciones para mejorar el framework

Prioridades de calidad propuestas: 1º no romper nada · 2º seguridad · 3º estilo del equipo

¿Correcto?  [Sí] [Cambiar punto de partida] [Cambiar prioridades]
```

### 3.3 Confidencialidad (sobre lo existente)

graphify y los subagentes envían el código al modelo. Antes de analizar un sistema existente, la misión pregunta siempre: **"¿tu organización permite enviar este código a Claude?"**. Si la respuesta es no o no sé, se detiene y explica las opciones (aprobación interna, análisis solo de las partes permitidas, graphify solo AST local sin extracción semántica).

### 3.4 Idioma

Los entregables que lee el cliente o el equipo (misión, spec, arquitectura, README, PR) salen en el idioma del encargo. Las instrucciones internas a los agentes van en inglés.

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
| 8 | Tarea | `T001` | Unidad de trabajo de un subagente | Plan | `T001 [P] [US-01] serves: AC-01.1 — <cómo>` |
| 9 | Test | — | Evidencia de un AC o un QS | Build | nombre/docstring con el ID |

### El objetivo de la arquitectura

La arquitectura **no tiene un objetivo propio: su objetivo es cumplir los objetivos de calidad ordenados (QG), bajo las restricciones de la misión, con el mínimo de piezas.** Lo funcional casi siempre cabe en cualquier arquitectura; lo que decide su forma son los atributos de calidad.

Nunca se escribe "escalable" o "seguro". Siempre un escenario medible:

> **QS-1** (sirve a QG-2 Fiabilidad): **fuente** jurado · **estímulo** sube un audio de 5 min · **entorno** wifi del evento, en directo · **artefacto** flujo subir → resumen · **respuesta** muestra el resumen · **medida** ≤ 60 s, 5 de 5 ensayos sin error.

### Regla de trazabilidad

- **Hacia arriba:** todo ADR, componente, tarea, test y commit lleva `serves: <ID> — <cómo lo sirve>`. Sin `serves:`, con un ID inexistente o con una justificación vacía = **huérfano → rechazado**. Sale de dos formas: va a "Fuera de alcance / parking" de la tarjeta, o entra como solicitud de cambio (§5, Cambios).
- **Hacia abajo:** todo O tiene ≥ 1 KR y ≥ 1 AC; todo QG tiene ≥ 1 QS; todo AC tiene ≥ 1 tarea y ≥ 1 test; todo QS tiene evidencia.

Cómo se aplica, en tres capas:
1. **Registro:** `docs/mission.md` es la única fuente de IDs válidos.
2. **Script determinista** (`shipwright trace`, milisegundos, sin LLM): corre en el gate de Plan, en cada commit de Build y en Verify. Falla ante huérfanos, IDs inexistentes o coberturas vacías.
3. **Revisión semántica:** el script solo comprueba que el ID exista, y un agente podría poner `serves: O-1` a cualquier cosa. Por eso el revisor de cada tarea y el de Verify comprueban que la justificación tenga sentido y preguntan "¿algo del diff no sirve a ningún objetivo?". Cada subagente recibe como primera línea `Sirves a <ID>: <texto>`.

### Tarjeta de misión (`docs/mission.md`)

```
# Misión M: <verbo + resultado, una frase>
Entregable: app | funcionalidad | integración | arreglo | prueba de concepto | informe
Punto de partida: desde cero | sobre lo existente (<repo/sistema>, convenciones: <enlace>)
Confidencialidad: <permitido enviar código a Claude: sí/no/parcial + quién lo autorizó>
Plazo: <fecha/hora>
Idioma de entregables: <idioma>
Personas: quien pide · usuario final · quien aprueba · quien mantiene

Objetivos:            O-1 Cuando …, <actor> quiere … para …
Métricas:             KR-1 <métrica: base → meta, cómo se mide>
Calidad (ordenada):   QG-1 … · QG-2 … · QG-3 …
Restricciones:        tecnología impuesta, presupuesto, compliance, "no tocar X"
Definition of Done:   KR medidos + todos los AC verificados + todos los QS demostrados + <docs/PR/demo>
Fuera de alcance / parking: …
Suposiciones abiertas: …
No aplica: <elemento del método> — <motivo>
```

### Ejemplos

**A — Desde cero (hackatón, 24 h): "app de IA que resume reuniones"**
- M: demo ganadora de un resumidor de reuniones · entregable app (demo).
- O-1: cuando sale de una reunión, un asistente quiere un resumen con acciones para no repasar la grabación.
- KR-1: resumen de un audio de 5 min en ≤ 60 s · KR-2: el jurado puntúa la utilidad ≥ 4/5.
- QG: 1 Tiempo hasta la entrega · 2 Fiabilidad · 3 Usabilidad.
- QS-1: el de arriba · QS-2: si la API falla, se muestra un resumen precargado en ≤ 2 s.
- ADR-1 (serves QS-1): transcripción + LLM gestionados, sin colas propias · ADR-2 (serves QS-2): plan B con ejemplo grabado.
- No aplica: plan de rollback — sin usuarios previos que proteger.
- Huérfano rechazado: "login de usuarios" → parking.

**B — Sobre lo existente (empleado): "login con Google en el sistema existente"**
- M: los usuarios entran con Google · entregable funcionalidad (PR).
- O-1: el empleado entra sin crear otra contraseña · KR-1: login funcional en staging y 0 tests existentes rotos.
- QG: 1 Seguridad · 2 No romper nada · 3 Consistencia con el equipo.
- QS-1: alguien manipula `state` en el callback → 4xx y no se crea sesión (100%) · QS-2: desplegado con el flag apagado → 0 cambios en flujos actuales · QS-3: sin patrones ni dependencias nuevas sin ADR.
- ADR-1 (QS-3): extender la estrategia de auth existente · ADR-2 (QS-2): feature flag + rollback · ADR-3 (QS-1): vincular cuentas por email verificado.
- Huérfano rechazado: "refactor del módulo de sesiones" → parking.

## 5. Pipeline

```
 encargo
    │
 [0] MISSION ─► [1] INTAKE ─► [2] ARCHITECT ─► [3] PLAN ─► [4] BUILD ─► [5] VERIFY ─► [6] SHIP ─► [7] RETRO
       ▲ confirma    ▲ gate        ▲ gate          ▲ gate      (por tarea)    ▲ gate       ▲ gate       │
       └──────────────── solicitudes de cambio vuelven a INTAKE como delta ──────────────────────────────┘
                                                                     lecciones ─► nueva versión del framework
```

Todas las fases y todos los gates se ejecutan siempre.

| # | Fase | Comando | Artefactos de salida | Gate |
|---|---|---|---|---|
| 0 | Mission | `/shipwright:mission` | `docs/mission.md` (borrador), explicación al usuario | Usuario confirma |
| 1 | Intake | `/shipwright:intake` | `mission.md` completa, `docs/spec/requirements.md`, `existing-system.md` (sobre lo existente), glosario, grafo | Humano aprueba |
| 2 | Architect | `/shipwright:architect` | `ARCHITECTURE.md`, `docs/adr/`, QS, componentes | Humano aprueba |
| 3 | Plan | `/shipwright:plan` | `docs/plan/tasks.md` | Humano aprueba |
| 4 | Build | `/shipwright:build` | código + tests, grafo actualizado | Automático (hooks + trace + revisor) |
| 5 | Verify | `/shipwright:verify` | `docs/verify/report.md` | Humano aprueba |
| 6 | Ship | `/shipwright:ship` | entrega según tipo, README, CHANGELOG | Humano confirma |
| 7 | Retro | `/shipwright:retro` | `docs/retro.md`, propuestas de cambio al framework | Humano aprueba cambios |
| — | Cambio | `/shipwright:change` | delta sobre spec/arquitectura/plan | Humano aprueba |
| — | Estado | `/shipwright:status` | fase actual, pendientes, métricas hasta ahora | — |

### Fase 0 — Mission
- Lee el encargo; detecta el punto de partida y propone el tipo de entregable.
- **Sobre lo existente:** pregunta de confidencialidad (§3.3) antes de leer código.
- Crea `docs/mission.md` en borrador y, si es desde cero, el repo del proyecto en su propia carpeta.
- Comprueba herramientas: git, Node, graphify (`graphify --help`), runtime del lenguaje.
- Arranca el registro automático de métricas.
- Muestra la explicación al usuario (§3.2) y espera confirmación.

### Fase 1 — Intake (entender el problema y, si aplica, el sistema)
1. **Sobre lo existente — entender el sistema:** `/graphify .` sobre el repo; extraer convenciones (`code-architect` de ECC) y el comportamiento actual (`spec-miner` de ECC). Resultado: `docs/spec/existing-system.md`.
2. **Ingesta del encargo:** documentos en `docs/client/` → `/graphify docs/client --mode deep`. Las aristas `AMBIGUOUS` se convierten en preguntas.
3. **Entrevista completa** (AskUserQuestion, bloques de hasta 4 preguntas con opciones y una opción recomendada). Se recorre **siempre la checklist entera**:
   - Problema y objetivo; para quién (usuarios, roles, personas)
   - Métricas de éxito y criterio de la demo/entrega
   - Prioridades de calidad (orden de los 3 QG)
   - Flujos principales y casos límite
   - Datos: entidades, volumen, origen, retención, privacidad
   - Integraciones y servicios externos
   - Seguridad y autenticación; cumplimiento normativo
   - Rendimiento, disponibilidad y escalado esperado
   - Plataforma, dispositivos, accesibilidad, idioma
   - Restricciones: tecnología, presupuesto, plazo, equipo
   - Despliegue, operación y mantenimiento posterior
   - Riesgos conocidos y qué haría fracasar la misión
   - Lo que expresamente queda fuera
4. **Respuesta "no sé":** el agente investiga (web, docs del sponsor o del cliente, grafo de misiones pasadas) y vuelve con opciones fundamentadas y sus fuentes. Lo que siga sin resolverse queda como **suposición explícita** con dueño.
5. **Salida:** tarjeta de misión completa (O, KR, QG ordenados, DoD, parking, no aplica) + `requirements.md` con historias `US-NN` (MoSCoW), criterios **EARS** `AC-NN.M` con `serves: O-n`, no funcionales medibles, fuera de alcance, suposiciones, preguntas abiertas.
6. **Revisión** por subagente *analyst*: contradicciones, huecos, criterios no verificables, objetivos sin métrica, preguntas de la checklist sin cubrir.
7. **Gate.** La spec aprobada queda protegida por hook; desde aquí solo cambia vía `/shipwright:change`.

### Fase 2 — Architect
1. Contexto: `/graphify query` sobre el grafo de requisitos (y del sistema si es sobre lo existente); grafo global y `LESSONS.md` de misiones pasadas.
2. Por cada QG, sus **escenarios QS** medibles.
3. Stack: desde cero se elige con `docs/catalogo-stack.md` y se registra en ADR; sobre lo existente se usa el actual y cualquier dependencia nueva requiere ADR.
4. `ARCHITECTURE.md` con **arc42 completo**: objetivos y restricciones (QG + QS), contexto (C4 L1), contenedores (C4 L2), componentes, modelo de datos, contratos/API, flujos clave (secuencia), decisiones transversales (auth, errores, logging, configuración, seguridad, observabilidad), despliegue, riesgos y deuda, glosario, matriz `QS/US → componente`. Sobre lo existente: primero el estado actual y luego el cambio. Lo desconocido se marca `TBD` y genera pregunta.
5. **ADRs MADR**, uno por decisión relevante, cada uno con `serves: [QS-n]` y alternativas consideradas.
6. Revisión en paralelo: *architect-reviewer* (¿cada QS está cubierto? ¿sobra alguna pieza?), *security-reviewer*, *council* de ECC para decisiones disputadas.
7. **Gate.** Al aprobar, se instalan en el proyecto los packs del stack (§10).

### Fase 3 — Plan
- Tareas de 2–15 min de agente: `T001 [P] [US-NN] serves: AC/QS — <cómo>`, rutas, paso de verificación, complejidad 1–10 (> 6 se divide).
- Orden: walking skeleton primero (desde cero) o preparación segura del cambio (sobre lo existente: flag, tests de caracterización), luego verticales por prioridad.
- `shipwright trace` + revisión de consistencia spec ↔ arquitectura ↔ tareas.
- **Gate.**

### Fase 4 — Build
- Un subagente nuevo por tarea, con `Sirves a <ID>` como primera línea y la tarea autocontenida.
- TDD: test del criterio primero (rojo) → implementación mínima (verde) → refactor.
- Tareas `[P]` en paralelo con git worktrees.
- Hooks: tests + lint + typecheck (una vez por turno), protección de spec aprobada, `shipwright trace` en cada commit (mensaje con `serves:`).
- Tras cada tarea: revisor (calidad + validez del `serves`), commit, `graphify update .`.
- Desviación de la arquitectura → `/shipwright:change` con ADR nuevo antes de seguir.

### Fase 5 — Verify
- Matriz `O → KR → AC → test → estado` y `QG → QS → evidencia`. Un AC sin test o un QS sin evidencia = fallo.
- Revisiones paralelas (workflow `orch-review` de ECC + verificador adversarial): correctitud, seguridad, sobreingeniería, documentación vs código, trabajo huérfano, revisores del lenguaje del stack.
- E2E de los flujos críticos. Sobre lo existente: suite completa del sistema en verde.
- `report.md`: veredicto por requisito (verified / partial / failed) y Definition of Done.
- **Gate.**

### Fase 6 — Ship
Según el entregable: deploy, pull request con nota de impacto y rollback, demo grabada o informe. Docs finales (README, CHANGELOG, docs de usuario/operación). Grafo final al historial global (`graphify global add`). **Gate:** el humano confirma antes de desplegar o publicar.

### Fase 7 — Retro
Ver §9.

### Cambios a mitad de misión — `/shipwright:change`
Inspirado en OpenSpec: el cambio se escribe como **delta** (ADDED / MODIFIED / REMOVED) sobre la spec, la arquitectura y el plan, con objetivos afectados, tareas a rehacer, impacto en plazo y riesgos. Gate humano; al aprobar se aplica y se re-ejecuta `shipwright trace`.

## 6. Puertas (gates)

En cada gate el agente presenta: resumen de 5 líneas, artefacto generado, objetivos que cubre, lo marcado como "No aplica", riesgos y suposiciones, y pregunta con opciones: **Aprobar / Pedir cambios / Volver a fase anterior**. Nunca avanza sin respuesta explícita.

## 7. Estructura de un proyecto

```
mi-proyecto/
├── CLAUDE.md                  # contexto mínimo + enlace a mission.md
├── docs/
│   ├── mission.md             # tarjeta de misión + cadena de objetivos (fuente de IDs)
│   ├── client/                # material original del encargo (inmutable)
│   ├── spec/requirements.md
│   ├── spec/existing-system.md   # sobre lo existente
│   ├── spec/glossary.md
│   ├── changes/NNN-*.md       # solicitudes de cambio (deltas)
│   ├── architecture/ARCHITECTURE.md
│   ├── adr/0001-*.md
│   ├── plan/tasks.md
│   ├── verify/report.md
│   ├── metrics.md             # generado automáticamente
│   └── retro.md
├── graphify-out/
├── src/ …
└── tests/ …
```

Sobre lo existente, `docs/` se crea dentro del repo en una carpeta propia (por defecto `docs/shipwright/<misión>/`) para no mezclarse con la documentación del equipo, salvo que el equipo indique otra cosa.

## 8. Uso de graphify en cada fase

| Fase | Comando | Para qué |
|---|---|---|
| Intake (existente) | `/graphify .` | Mapa del sistema: módulos centrales, dependencias |
| Intake | `/graphify docs/client --mode deep` | Entidades, módulos y ambigüedades del encargo |
| Intake | `/graphify add <url>` | Añadir referencias web |
| Architect | `/graphify query`, `/graphify path "A" "B"`, `graphify god-nodes` | Agrupar requisitos en componentes, ver dependencias |
| Architect | grafo global + `LESSONS.md` | Reutilizar soluciones y evitar errores pasados |
| Build | `graphify hook install` / `graphify update .` | Grafo de código al día (AST, sin coste) |
| Build (existente) | `graphify affected "X" --depth 2` | Radio de impacto antes de tocar un componente |
| Ship | `/graphify . --update` + `graphify global add` | Grafo final al historial global |
| Retro | `graphify save-result` + `graphify reflect` | Qué funcionó / qué no → `LESSONS.md` |

Gotchas: `query` busca subcadenas literales (consultar en el idioma de las etiquetas); hook y `--watch` solo actualizan código; subagentes de extracción `general-purpose`; filtrar `INFERRED` por confianza. Sin permiso de confidencialidad, solo `graphify update .` (AST local, no envía código).

## 9. Automejora y versiones

### Datos automáticos
Un hook registra en `docs/metrics.md`, sin intervención: inicio y fin de cada fase, vueltas en cada gate, tareas rehechas, tests fallidos, hallazgos de revisión por severidad, solicitudes de cambio y trabajo huérfano detectado.

### Bucle de retro (obligatorio al cerrar cada misión)
1. **Retro guiada:** ¿qué fase fue lenta?, ¿qué error se repitió?, ¿qué pregunta faltó en la checklist?, ¿qué "no sé" no se resolvió bien?, ¿qué decisión se revirtió?, ¿qué herramienta de ECC faltó o sobró?
2. **Lecciones**, clasificadas: regla (checklist de fase) · pregunta faltante (entrevista) · patrón reutilizable (catálogo/plantilla) · error de proceso (skill/comando) · herramienta (índice de ECC).
3. **Propuesta:** diff concreto sobre el framework (patrón `learn-eval` de ECC: contenido de la sesión tratado como no confiable, diff visible).
4. **Gate humano:** aprobar, editar o descartar cada cambio.
5. **Eval:** las skills modificadas pasan sus evals (`skill-comply` de ECC / `skill-creator`) y la nueva versión se compara contra el **banco de misiones de referencia**. Si empeora, no se publica.
6. **Versión:** commit + tag semver + CHANGELOG citando la misión de origen. PATCH texto/checklist · MINOR regla/plantilla/skill · MAJOR fases o artefactos.
7. **Poda:** cada 5 misiones se revisan reglas obsoletas; límite de tamaño por archivo de reglas.

### Banco de misiones de referencia
Tres misiones fijas en `benchmarks/`, con encargo, respuestas de entrevista predefinidas y criterios de evaluación:
1. Desde cero: app de IA (ej. resumidor de reuniones).
2. Desde cero: API/backend con datos y autenticación.
3. Sobre lo existente: funcionalidad sobre un repo de ejemplo con tests.

Cada versión del framework se ejecuta contra el banco y se compara tiempo, criterios verificados, hallazgos de revisión y calidad de docs. Sin este banco, "mejora" es opinión.

Nada aprende ni se inyecta solo: solo retro bajo demanda con aprobación humana. Registro central: `lessons/LESSONS.md`.

## 10. Catálogo de stack y packs

Ver [`catalogo-stack.md`](catalogo-stack.md). Desde cero se decide en Architect y se registra en ADR; sobre lo existente se detecta del sistema.

Shipwright trae **todo** el catálogo de desarrollo de ECC (reglas, skills y revisores de todos los lenguajes y frameworks, skills de IA y agentes), pero **nada de stack se carga globalmente**. Tras el gate de Architect se instalan en el proyecto (`.claude/skills/`, `.claude/rules/`, `.claude/agents/`) los packs del stack elegido. Ejemplo: Python + FastAPI + LlamaIndex → `python`, `fastapi`, `rag-pipeline-reviewer`. Si el stack cambia (nuevo ADR), se reinstala.

## 11. ECC como base (upstream)

[ECC](https://github.com/affaan-m/ecc) (MIT, © Affaan Mustafa) es la base de agentes y skills. Análisis: [`investigacion/ecc.md`](investigacion/ecc.md).

### Principios de integración
1. **Todo el catálogo de desarrollo de ECC, sin cargarlo entero.** Se copia en `vendor/ecc/` (lista en `vendor/ecc.manifest.json`), pero no se registra como plugin: así no consume ~29k tokens por turno ni compite con nuestras fases.
2. **Índice de herramientas** (`vendor/ecc.index.md`): para cada fase y situación, qué agente, skill, workflow o regla de ECC usar y cuándo. Nuestras fases lo consultan e invocan la herramienta bajo demanda (un subagente con el prompt del agente de ECC, o la skill leída cuando hace falta). El índice se regenera en cada sincronización y la retro lo mejora.
3. **La copia de ECC nunca se edita.** Nuestras skills la referencian y añaden encima nuestras reglas (misión, objetivos, `serves`, EARS, gates, graphify). Cada actualización entra sin conflictos.
4. **Atribución** en `THIRD_PARTY_NOTICES.md`.

### Excluido por seguridad, coste o compatibilidad
- Observer de aprendizaje automático (instincts que se autoinyectan: vector de prompt injection).
- Hooks con llamadas `claude -p` ocultas (coste y datos sin consentimiento visible).
- `mcp-health-check` y configs MCP de patrocinadores / `npx -y` sin versión.
- GateGuard (+35–45% de turnos sin beneficio demostrado).
- Fuera de alcance (no son herramientas de desarrollo): adaptadores multi-harness, `ecc2/`, instalador npm, skills de dominio ajeno (trading, logística, marketing…).

### Sincronización con revisión
GitHub Action diario en el repo de Shipwright:
1. Detecta release nueva de ECC.
2. Descarga las rutas del manifiesto a una rama `ecc-sync/vX.Y.Z` y regenera el índice.
3. Comprobaciones automáticas: rutas y frontmatter válidos, referencias de Shipwright resuelven, filtro de seguridad (sin hooks nuevos, sin `npx -y` sin versión, sin URLs de red nuevas, sin `claude -p`, sin texto promocional), evals de fases afectadas.
4. **Revisión por IA del diff completo**, con foco en instrucciones sospechosas escritas en prosa (los filtros por patrones no las detectan).
5. Abre un **pull request** con el resumen de cambios, resultado de las comprobaciones y de la revisión.
6. **El maintainer hace el merge.** Al hacerlo: CHANGELOG + versión PATCH de Shipwright. Los usuarios lo reciben al actualizar el plugin.

### Herramientas de ECC por fase (punto de partida del índice)

| Fase | Herramientas ECC |
|---|---|
| Mission | `commands/project-init.md` |
| Intake | `commands/prp-prd.md`, `skills/intent-driven-development`, `skills/product-capability`, `agents/spec-miner.md`, `agents/code-architect.md` |
| Architect | `agents/architect.md`, `agents/code-architect.md`, `skills/architecture-decision-records`, `skills/contract-first`, `skills/council`, `skills/hexagonal-architecture`, `skills/plan-canvas`, `skills/api-design` |
| Plan | `skills/blueprint`, `agents/planner.md`, `skills/plan-orchestrate`, `skills/orch-pipeline` |
| Build | `skills/tdd-workflow`, `agents/tdd-guide.md`, `agents/*-build-resolver.md`, `skills/dmux-workflows`, skills del stack |
| Verify | `workflows/orch-review.workflow.js`, `agents/code-reviewer.md`, `agents/security-reviewer.md`, `agents/e2e-runner.md`, `skills/e2e-testing`, `skills/verification-loop`, `agents/silent-failure-hunter.md`, `agents/pr-test-analyzer.md`, revisores por lenguaje |
| Ship | `skills/deployment-patterns`, `skills/docker-patterns`, `skills/kubernetes-patterns`, `skills/canary-watch`, `agents/doc-updater.md`, `skills/living-docs-governance` |
| Retro | `commands/learn-eval.md`, `scripts/lib/skill-evolution/`, `skills/skill-comply`, `skills/rules-distill`, `skills/skill-stocktake` |
| Misiones de IA | `skills/eval-harness`, `skills/agent-harness-construction`, `skills/agent-security-hardening`, `skills/mcp-server-patterns`, `skills/cost-aware-llm-pipeline`, `skills/prompt-caching-strategy`, `agents/rag-pipeline-reviewer.md`, `skills/ui-demo` |
| Stack | `rules/<lenguaje>` (21), skills y revisores por framework |

## 12. Requisitos técnicos

- Claude Code, git, Node (hooks y scripts solo en Node, para funcionar igual en Windows, macOS y Linux), Python 3.10+ con `graphifyy`.
- Los plugins de Claude Code no pueden instalar `rules/`: `/shipwright:mission` las copia al proyecto cuando hacen falta.

## 13. Hoja de ruta

| Versión | Contenido |
|---|---|
| v0.1–v0.3 | Método, investigación, integración con ECC, misiones y cadena de objetivos |
| v0.4 | Método sin recortes, un solo método (desde cero / sobre lo existente), crítica aplicada *(actual)* |
| v0.5 | Esqueleto del plugin + `vendor/ecc` completo + índice + sync con PR; `mission` + `intake` funcionando; `shipwright trace`; hook de métricas |
| v0.6 | `architect` + plantillas arc42/MADR/QS + packs de stack por proyecto |
| v0.7 | `plan` + `build` (subagente por tarea, TDD, hooks) + `change` |
| v0.8 | `verify` + `ship` + `status` |
| v0.9 | `retro` + evals de skills + banco de misiones de referencia + versionado automático |
| v1.0 | Probado en ≥ 3 misiones reales (≥ 1 desde cero, ≥ 1 sobre lo existente) |
| v2.0 | Orquestador con Claude Agent SDK (+ LangGraph para estado y gates) que ejecuta las fases ya probadas |

## 14. Fuentes del método

Detalle en [`investigacion/`](investigacion/).

| Referencia | Lo que tomamos |
|---|---|
| ECC | Base de agentes, skills, packs de stack y revisores (§11) |
| GitHub Spec Kit | Constitución con gates verificables, chequeo de consistencia, formato de tareas |
| AWS Kiro / cc-sdd | Criterios EARS, trío requirements/design/tasks |
| BMAD Method | Roles como subagentes revisores, historias autocontenidas |
| Superpowers | Tareas pequeñas verificables, TDD, subagente por tarea |
| GSD | Orquestador ligero + subagentes por archivos, límites de tamaño |
| Taskmaster | Complejidad y división automática |
| OpenSpec | Cambios como deltas sobre una spec viva |
| Compound Engineering | Retro que modifica el propio sistema |
| Agent OS | Estándares cargados solo cuando son relevantes |
| arc42 / C4 / MADR | Formatos de arquitectura; objetivos de calidad ordenados (arc42 §1.2) |
| ISO 25010 / ATAM | Atributos de calidad y escenarios medibles (QG, QS) |
| JTBD / Impact mapping / OKR | Objetivos de usuario y métricas de éxito (O, KR) |
