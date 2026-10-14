---
status: draft
---
# <Misión: verbo + resultado, una frase>

| Campo | Valor |
|---|---|
| Entregable | app · funcionalidad · integración · arreglo · prueba de concepto · informe |
| Punto de partida | desde cero · sobre lo existente (`<repo>`) |
| Plazo | `<fecha y hora>` |
| Idioma | `<idioma>` |
| Datos y leyes | pública · interna · personal · pagos · salud — <ley aplicable, p. ej. Ley 1581> — ASVS <L1/L2/L3> |
| Plataforma | <la que ya usa el proyecto · por decidir · no aplica (PR)> |
| Confidencialidad | <se permite enviar el código a Claude: sí / parcial / local — autorizó `<quién>`> |
| Aprueba | <quién> |

## Objetivos

<!-- Cuando <situación>, <actor> quiere <progreso> para <resultado> — medida: <número y cómo se mide>. -->
- O-1: Cuando …, … quiere … para … — medida: …

## Prioridades de calidad

1. <atributo> — <por qué va primero>
2.
3.

## Sistema actual

<!-- Solo sobre lo existente; si no, borra la sección. Hechos con su archivo, no opiniones.
     Stack, cómo se prueba, convenciones (archivo:línea), lo que no puede cambiar, puntos de integración.
     Mapa del código: graphify-out/GRAPH_REPORT.md -->

## Historias y criterios

<!-- MoSCoW. riesgo: alto si toca dinero, datos personales, permisos o aislamiento, una integración externa u
     operaciones masivas o irreversibles sobre datos; si no, bajo. Ante la duda, alto.
     Criterios EARS: WHEN <evento> / IF <condición> THEN / WHILE <estado> … THE SYSTEM SHALL <respuesta verificable>.
     Cada historia Must: al menos un criterio del camino feliz y uno de comportamiento no deseado. -->

### US-01 <título> (Must)
Como <rol>, quiero <capacidad> para <beneficio>.
serves: O-1
riesgo: bajo — <motivo>

- **AC-01.1** WHEN <evento> THE SYSTEM SHALL <respuesta verificable>
  serves: US-01
- **AC-01.2** IF <condición no deseada> THEN THE SYSTEM SHALL <respuesta>
  serves: US-01

## Decisiones

<!-- Solo las que cambian algo: stack, datos, autenticación, integración, despliegue, toda dependencia nueva. -->
| Decisión | Alternativa descartada | Por qué |
|---|---|---|
| | | |

## Diseño

<!-- Lo mínimo para que los builders no choquen: componentes y flujo clave (≤ 15 líneas o un diagrama Mermaid),
     modelo de datos que cambia, contratos (ruta del OpenAPI si hay API). Nada que ninguna historia necesite. -->

## Amenazas

<!-- Solo para historias de riesgo alto; si no hay, borra la sección. Cada amenaza con su mitigación como criterio
     o tarea (la tarea lleva serves: TM-n). Cada amenaza es un elemento de lista con este contenido:
     TM-1: <activo> · <qué puede salir mal> · mitigación: <AC o tarea> — serves: US-NN -->


## Pruebas

- Tests de aceptación: `<ruta, p. ej. tests/acceptance/>` (escritos por QA, bloqueados).
- Pertinentes: <tipo — motivo, una línea por tipo; los pesados solo para historias de riesgo alto>.
- No aplica: <resto de tipos> — <motivo>.

## Tareas

<!-- Cortes verticales: 1–3 tareas por historia. [P] = toca archivos distintos y no depende de otra tarea abierta. -->

### T001 [P] [US-01] <título>
serves: AC-01.1, AC-01.2
- Archivos: `<rutas>`
- Verificación: `<comando o test>`
- depends: —

## Supuestos y preguntas abiertas

| Supuesto | Dueño | Confirmar antes de |
|---|---|---|
| | | |

## Fuera de alcance

-
