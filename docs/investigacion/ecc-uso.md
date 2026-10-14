# Cómo usa Shipwright ECC, y dónde se gastaban tiempo y tokens (2026-10-14)

Estudio sobre la primera misión real (sistema-taller, Shipwright 0.13) para decidir cómo integrar ECC sin desperdicio. Fuentes: el catálogo vendorizado de ECC v2.2.3 (`vendor/ecc/`) y las transcripciones de Claude Code de la misión, leídas sin modificar con `scripts/session-report.mjs` y scripts de análisis de un solo uso.

**Método.** "Contexto leído" = tokens de entrada + lectura de caché + escritura de caché de cada turno, contando cada mensaje una sola vez (Claude Code repite el uso en cada bloque de una misma respuesta). "Base por turno" = contexto del primer turno de un agente, antes de que lea nada: system prompt, definiciones de herramientas, reglas y memoria cargadas siempre. Los tokens de caché cuestan una fracción del precio normal, pero el tamaño del contexto sí afecta a la latencia de cada turno y a cuánto se llena la ventana. Las cifras marcadas *estimación* son proyecciones y se verificarán con `session-report` en la próxima misión.

## 1. Para qué está hecho ECC

ECC asume que **el hilo principal de Claude programa** y llama a especialistas alrededor.

| Pieza | Cuántas | Para qué | Cómo se carga |
|---|---|---|---|
| Agentes | 62 | ~33 solo revisan (herramientas de solo lectura); 6 planifican o exploran; 12 arreglan errores de build por lenguaje; ~11 escriben en su especialidad (TDD, e2e, rendimiento, accesibilidad, docs, refactor, arnés generador/evaluador) | Bajo demanda; cada uno con su lista de herramientas restringida |
| Skills | 191 | **Cómo construir**: patrones, testing y guías por framework y stack | Bajo demanda (solo la descripción está siempre visible) |
| Reglas | 22 paquetes | Estilo, patrones, seguridad y testing por lenguaje; más reglas de proceso en `common/` | **Siempre cargadas** salvo las que declaran `paths:` |
| Comandos | 48 | Procedimientos (`/tdd`, `/<lenguaje>-test`, `/build-fix`, `/feature-dev`, `/prp-implement`, `/gan-build`) | Al invocarlos |

No tiene un agente constructor general: construir es trabajo del hilo principal con las skills y las reglas.

## 2. Hallazgos

### H1. Cada agente de Shipwright arrancaba con ~50k tokens de base por turno
| Agente | Herramientas | Base por turno |
|---|---|---|
| analyst, architecture-reviewer (Shipwright) | Read, Grep, Glob | 9k |
| caveman reviewer | Read, Grep, Bash | 17k |
| typescript-reviewer, react-reviewer (ECC) | Read, Grep, Glob, Bash | 20–21k |
| builder, qa-lead, security-lead, devops-lead, docs-lead, ux-lead (Shipwright) | **todas** (no declaraban `tools:`) | 42–50k |

Sin `tools:`, un agente hereda todas las herramientas de la sesión, incluidas las de los MCP del usuario (Gmail, Shopify, Docs, Chrome) y la de lanzar agentes. **En los builders, la base fue el 58 % de todo su contexto leído** (50k × 759 turnos ≈ 38M de 65,5M).
**Arreglo (v1.1.1):** cada agente declara solo las herramientas que usa. *Estimación:* la base del builder baja a ~25k, unos 19M menos por misión como esta.

### H2. Las reglas de proceso de ECC se cargaban en cada turno de cada agente y contradicen el método
`rules/common` incluye `agents.md`, `development-workflow.md`, `git-workflow.md` y `code-review.md` (1.436 palabras, ~1,9k tokens). Ordenan buscar en GitHub antes de programar, escribir PRD y arquitectura, lanzar `ecc:planner` y `ecc:tdd-guide` (que no existen sin el plugin de ECC) y revisar después de cada cambio. Los agentes del taller no las siguieron (0 búsquedas en GitHub, 0 agentes `ecc:`), pero las pagaron en todos los turnos: *estimación* ~3M tokens.
**Arreglo (v1.1.1):** `install-packs.mjs` ya no instala esas cuatro; las de estilo, patrones, rendimiento, seguridad y testing sí.

### H3. Las skills de construcción no se usaron nunca
Instaladas: backend-patterns, postgres-patterns, prisma-patterns, react-testing. **Los 33 builders leyeron 0 skills.** ECC solo intervino en Build como revisor.
**Arreglo (v1.1.0):** cada builder recibe las rutas de las skills que tocan sus archivos y las lee antes de programar.

### H4. Revisar por tarea con agentes caros
| Revisión | Ejecuciones | Contexto por ejecución |
|---|---|---|
| Revisor de lenguaje de ECC | 7 | **0,11M** |
| security-lead por tarea | 9 | 0,41M |
| qa-lead revisando el diff de tests por tarea | 16 | 0,59M |

El revisor de ECC es 4–5 veces más barato: herramientas restringidas y una tarea acotada. Además, code-reviewer y el revisor del lenguaje se solapan casi por completo.
**Arreglo (v1.0 y v1.1.1):** una sola revisión por tanda, con el revisor del lenguaje (o code-reviewer si no hay) y la comprobación de integridad de tests añadida; qa-lead deja de revisar diffs; seguridad solo en diffs sensibles.

### H5. Un solo agente escribió los 146 tests de aceptación
25,7M de contexto, 89 turnos, 31 minutos: el contexto crece con cada archivo escrito y se relee entero en cada turno.
**Arreglo (v1.0):** un qa-lead por historia, en paralelo. *Estimación:* pocos minutos y una fracción del contexto, porque cada agente ve solo su historia.

### H6. Los builders gastaban la mitad de su tiempo de herramientas en tests
188 ejecuciones de tests (54 % del tiempo en herramientas), muchas de suites amplias de más de 2 minutos.
**Arreglo (v1.0.1):** tests relacionados por tarea; suite completa una vez por tanda; recursos de test aislados por worktree.

### H7. El orquestador es el mayor consumidor por turno
El hilo principal leyó ~69M de contexto en 352 turnos; en Build, **~250k tokens por turno** de media. Cada informe de un subagente y cada salida de comando se queda en su contexto y se relee en todos los turnos siguientes.
**Arreglo (v1.1.1):** límites de longitud en los informes (builder 8 líneas, qa-lead 10, security-lead 15, revisor 15 hallazgos) y comandos con salida reducida al resumen y los fallos. **Pendiente:** medir el efecto; si sigue alto, mover la puerta por tarea a un script que devuelva una línea.

### H8. Esperas de fase y revisiones repetidas
~45 minutos esperando que el usuario lanzara la fase siguiente; dos rondas de revisión de arquitectura con correcciones (24 minutos, 17M de contexto entre revisores y forks).
**Arreglo (v1.0):** fases encadenadas y una sola revisión de la spec.

## 3. Reglas de integración que salen del estudio

1. **Un agente solo por independencia o paralelismo.** El conocimiento va como skill o regla al agente que trabaja.
2. **Herramientas mínimas por agente**: cada herramienta no usada se paga en todos los turnos.
3. **Los agentes de ECC son los revisores baratos**: uno por tanda, nunca dos que se solapen.
4. **Dentro de un agente de Shipwright no se lanzan agentes de ECC**: se lee su archivo y se aplica su método.
5. **De ECC se instala solo lo que construye o revisa**, nunca su proceso.
6. **Todo lo que llega al orquestador se relee en cada turno**: informes con tope y logs resumidos.
7. **Medir, no suponer**: `session-report.mjs` en la retro de cada misión.

## 4. Qué queda por medir

La próxima misión con v1.1.1, medida con `session-report.mjs`, debe confirmar o corregir las estimaciones de H1, H2, H5 y H7: base por turno de los builders, contexto del orquestador por turno y tiempo hasta empezar a construir.
