# Lecciones aprendidas

Una lección por entrada. Se añaden en la fase RETRO tras aprobación humana.

Formato:

```
## L-NNN — título corto
- Síntoma: qué pasó
- Causa: por qué
- Regla nueva: qué cambia en el framework
- Proyecto origen: nombre
- Versión: vX.Y.Z donde entró
```

## L-001 — Las revisiones independientes se perdían al cerrar la sesión
- Síntoma: la revisión de arquitectura corrió en segundo plano y sus hallazgos desaparecieron con la sesión.
- Causa: los revisores de solo lectura devolvían sus hallazgos solo al chat.
- Regla nueva: el revisor corre en primer plano y su respuesta se guarda en `review.md` antes de aprobar.
- Proyecto origen: sistema-taller
- Versión: v0.13.1

## L-002 — El mismo rigor para todo hacía lento lo simple
- Síntoma: nombres de archivo e interruptor recibieron el mismo análisis que crédito y respaldo.
- Causa: el método aplicaba todos los artefactos a todas las historias.
- Regla nueva: riesgo alto/bajo por historia; lo pesado solo en riesgo alto, comprobado por `trace.mjs`.
- Proyecto origen: sistema-taller
- Versión: v0.14.0 (simplificado en v1.0.0)

## L-003 — El método producía documentos en vez de software
- Síntoma: 7 h hasta empezar a construir, 55.700 palabras de proceso, 63 tareas para 4 funcionalidades, 200 ejecuciones de agentes previstas.
- Causa: 8 fases con 7 aprobaciones, revisores por tarea, tareas de 2–15 min, un documento por disciplina.
- Regla nueva: 4 fases y 2 aprobaciones; un documento de proceso; paralelo por defecto; revisión por tanda; contexto mínimo; ritmo visible contra el plazo.
- Proyecto origen: sistema-taller
- Versión: v1.0.0

## L-004 — Los builders ejecutaban suites completas en cada tarea
- Síntoma: 182 ejecuciones de tests en 20 tareas; el 29 % del tiempo de los builders.
- Causa: la puerta por tarea pedía la suite completa, cobertura y más; cada builder la corría varias veces.
- Regla nueva: tests relacionados por tarea, suite completa una vez por tanda; recursos de test aislados por worktree.
- Proyecto origen: sistema-taller
- Versión: v1.0.1

## L-005 — Agentes sin `tools:` pagaban ~50k tokens de base en cada turno
- Síntoma: builders y qa-lead arrancaban con 42–50k tokens por turno; los revisores de ECC, con 20k.
- Causa: sin `tools:` el agente hereda todas las herramientas de la sesión, incluidos los MCP del usuario.
- Regla nueva: cada agente declara solo las herramientas que usa; un agente solo por independencia o paralelismo.
- Proyecto origen: sistema-taller
- Versión: v1.1.1
