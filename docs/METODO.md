# Método Shipwright

Cómo Shipwright lleva un encargo hasta software funcionando, rápido y sin bajar la calidad. Versión **v1.0.1**.

## 1. Principios

1. **Velocidad primero, sobre un suelo de calidad fijo.** Lo que no se negocia: tests de aceptación escritos desde los criterios por un agente independiente y bloqueados; TDD; suite, tipos y lint en verde antes de integrar; revisión de seguridad de los diffs sensibles y escaneos; aprobación humana de la spec y de producción. Todo lo demás se mide por si acelera o frena.
2. **Los agentes construyen en paralelo; las comprobaciones ejecutables dan la calidad.** Un agente de QA por historia, un builder por tarea independiente, revisores lado a lado. La calidad la prueban tests y escaneos, no documentos.
3. **Deducir antes que preguntar.** Se lee el encargo, el repositorio y su documentación; se pregunta solo lo que bloquea, en una tanda. Lo demás es un supuesto con dueño y fecha.
4. **Un solo documento de proceso.** `spec.md` reúne objetivos, historias, criterios, decisiones, diseño mínimo, amenazas, pruebas y tareas. `verify.md` cierra con el veredicto. El producto entregado sí queda bien documentado (README que funciona, configuración, API, guías).
5. **Rigor según riesgo** (§3): lo pesado solo donde hay dinero, datos personales, permisos, integraciones u operaciones irreversibles.
6. **Dos aprobaciones humanas:** la spec (con el plan) y la entrega.
7. **Lo no negociable es determinista:** hooks y scripts, no ruegos en un prompt.
8. **Expertos de ECC por fase**, nombrados en cada paso, y los packs del stack instalados desde el primer commit.
9. **Principios de ingeniería** para todos los agentes ([`engineering-principles`](../reference/engineering-principles.md)): pensar antes de actuar, lo mínimo que funciona, cambios quirúrgicos, evidencia antes de afirmar, depuración por causa raíz, velocidad.

## 2. Fases

| # | Fase | Comando | Qué pasa | Humano |
|---|---|---|---|---|
| 1 | **Spec** | `/shipwright:spec "<encargo>"` | Lee el encargo y el sistema (explorador de código de ECC + graphify local, en paralelo); una tanda de preguntas; escribe `spec.md`; spec-reviewer la revisa; **aprobación**; packs del stack instalados; un qa-lead por historia escribe los tests de aceptación en paralelo; se bloquean | **Aprueba spec y plan** |
| 2 | **Build** | `/shipwright:build` | Tandas de tareas listas, cada una en su worktree con su builder; puerta ligera por tarea (tests del área + tipos; seguridad si el diff es sensible); revisión y suite completa por tanda; ritmo y hora estimada contra el plazo; pasada final de documentación con quick start probado y `/simplify` | — |
| 3 | **Verify** | `/shipwright:verify` | Huellas, tests ocultos, suite completa, tipos de prueba pertinentes, seguridad, `/code-review`, `/security-review`, cazador de fallos silenciosos; corrección en paralelo; **SHIP / NO SHIP** | Solo si NO SHIP |
| 4 | **Ship** | `/shipwright:ship` | PR, despliegue a producción con canario y rollback, o documento | **Aprueba la entrega** |
| — | Change | `/shipwright:change` | Delta con impacto y aprobación sobre la spec o los tests bloqueados | Aprueba |
| — | Status | `/shipwright:status` | Fase, ritmo, hora estimada contra el plazo, riesgos | — |
| — | Retro | `/shipwright:retro` | Opcional: lecciones → cambios probados al framework | Aprueba |

Las fases se encadenan solas: al aprobar la spec empieza Build, Build pasa a Verify y un SHIP lleva a la aprobación de la entrega. Los comandos sirven para retomar.

**Desde cero o sobre lo existente.** Desde cero: la spec elige el stack ([`catalogo-stack`](catalogo-stack.md)) y la primera tarea es un esqueleto que corre y despliega. Sobre lo existente: primero se pregunta si se permite enviar el código a Claude; la spec documenta el sistema actual en una sección y se siguen sus convenciones.

## 3. Trazabilidad, riesgo y presupuesto

Cadena: **O** objetivo (con medida) → **US** historia → **AC** criterio EARS → **T** tarea → test. Las historias de riesgo alto añaden **TM** amenazas (sirven a su historia; las tareas que las mitigan sirven a la amenaza).

- Cada elemento lleva `serves: <IDs>`. `scripts/trace.mjs` comprueba huérfanos, IDs y tipos inválidos, cobertura (todo O con historia, toda historia con criterio, todo criterio y amenaza con tarea) y, en Verify, que cada criterio tenga un test que lo cite y cada amenaza evidencia.
- **Riesgo.** Cada historia lleva `riesgo: alto — <motivo>` o `riesgo: bajo — <motivo>`. Es alto si toca dinero (cobros, facturación, caja, crédito), datos personales o sensibles, autenticación, permisos o aislamiento entre clientes o sedes, una integración externa, u operaciones masivas o irreversibles sobre datos. Ante la duda, alto.
  - Toda historia: criterios EARS, tests de aceptación, TDD, revisión de código, controles base de seguridad.
  - Solo riesgo alto: amenazas, tipos de prueba pesados (carga, DAST, matriz de autorización, exploratoria, recuperación), pasada adversaria. `trace.mjs` rechaza amenazas sobre historias de riesgo bajo.
- **Presupuesto** (comprobado por `trace.mjs`): ≤ 12 historias por misión, ≤ 6 criterios y ≤ 3 tareas por historia, ≤ 4 amenazas por historia de riesgo alto. Pasarse exige la línea `Presupuesto excedido: <TIPO> — <motivo>`, que el usuario ve en la aprobación.

## 4. Agentes

| Agente | Modelo | Cuándo |
|---|---|---|
| `spec-reviewer` | Opus | Revisa la spec antes de la aprobación (solo lectura) |
| `qa-lead` | Opus | Tests de aceptación por historia; revisión del diff de tests por tanda; verificación y veredicto |
| `security-lead` | Opus | Diffs sensibles y dependencias nuevas; verificación de seguridad; endurecimiento de producción |
| `builder` | Sonnet | Una tarea, tests primero, con contexto mínimo |
| `docs-lead` | Sonnet | Pasada final de documentación del producto y quick start probado |
| `devops-lead` | Sonnet | Solo si se despliega: staging y producción |

Expertos de ECC por fase: tabla en [`using-ecc`](../reference/using-ecc.md). El catálogo completo de ECC (324 piezas, sin modificar, en `vendor/ecc/`) se consulta con `scripts/ecc-find.mjs`; cada pieza leída en una misión queda registrada en `metrics.md`.

## 5. Estructura de una misión

```
.shipwright/state.json   fase, plazo, rutas, tests bloqueados, tareas hechas
<docsDir>/
  spec.md                el único documento de proceso (aprobado = protegido)
  review.md              hallazgos del spec-reviewer y qué se hizo con cada uno
  verify.md              veredicto y evidencia
  deploy.md              solo si se crea o cambia infraestructura de producción
  changes/               deltas aprobados
  client/                material original del encargo
  metrics.md             generado automáticamente
tests/acceptance/        bloqueados (hook + huellas SHA-256); ~1 de cada 5 oculto hasta Verify
```

`<docsDir>` es `docs/` desde cero y `docs/shipwright/<misión>/` en un sistema existente.

## 6. Protecciones deterministas

- Hook `PreToolUse`: bloquea editar `.shipwright/`, los tests bloqueados y los artefactos aprobados, salvo los archivos abiertos por un cambio aprobado.
- `lock.mjs`: huellas de los tests bloqueados e importación de los ocultos.
- `trace.mjs`: trazabilidad, riesgo y presupuesto.
- Hooks de métricas (inicio de fase, expertos de ECC usados) y de contexto (misión, fase, plazo y siguiente comando tras `/clear` o `/compact`).
- **Ningún despliegue a producción, cambio de DNS, recurso de pago, push o PR sin aprobación explícita del usuario.**

## 7. Banco y mejora

`benchmarks/` tiene 4 misiones fijas; `scripts/bench.mjs` puntúa una misión terminada y compara versiones. Es peor una versión que tarda más, necesita más rondas de aprobación, deja problemas de trazabilidad, se pasa del presupuesto o escribe más palabras de proceso. La retro opcional convierte lecciones en cambios probados contra el banco.

## Hoja de ruta

| Versión | Contenido |
|---|---|
| v0.5–v0.16 | Método de 8 fases (etiqueta `v0.16.0`) |
| **v1.0** | 4 fases, 2 aprobaciones, paralelo por defecto, un documento de proceso, expertos de ECC por fase *(actual)* |
| v1.x | Medido con el banco y en misiones reales |
| v2.0 | Orquestador autónomo con Claude Agent SDK |
