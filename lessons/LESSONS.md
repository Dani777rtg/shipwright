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
