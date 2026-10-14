# Shipwright

Plugin de Claude Code para llevar un encargo a software funcionando **rápido y bien hecho**: una spec que apruebas, agentes que construyen en paralelo con tests primero, verificación independiente y entrega con tu aprobación.

> Claude Code plugin: brief → approved spec → parallel multi-agent build with locked acceptance tests → independent verification → delivery. Built on ECC's expert agents.

**Estado:** v1.0 — 4 fases, 2 aprobaciones. La versión de 8 fases sigue disponible en la etiqueta `v0.16.0`.

## Instalar

Son **dos comandos separados**: escribe el primero, pulsa Enter y espera a que termine; luego el segundo.

1. Añadir el marketplace:
   ```
   /plugin marketplace add Dani777rtg/shipwright
   ```
   (Si se abre una caja "Enter marketplace source", escribe ahí solo `Dani777rtg/shipwright`.)
2. Instalar el plugin:
   ```
   /plugin install shipwright@shipwright
   ```

Comprueba escribiendo `/shipwright`: deben aparecer `/shipwright:spec`, `/shipwright:build`… Si no, ejecuta `/reload-plugins`.

Requisitos: git y Node 18+. Opcional: graphify (`pip install graphifyy`) para mapear sistemas existentes.

## Usar

```
/shipwright:spec "app de IA que resume reuniones, hackatón de 24 h"
```

Si el encargo viene en documentos (PDF, notas, transcripciones), pasa su ruta: `/shipwright:spec "C:\carpeta\encargo.md"`. Sirve igual para crear algo **desde cero** que para cambiar un **sistema existente**.

## Qué hace

| Fase | Qué pasa | Tú |
|---|---|---|
| 1. Spec | Lee el encargo y tu código, pregunta solo lo que bloquea, escribe una spec con historias, criterios verificables, riesgo, decisiones y tareas; un revisor la revisa | **Apruebas** |
| 2. Build | Un agente de QA por historia escribe los tests de aceptación (bloqueados); builders en paralelo, tests primero; revisión por tanda; ritmo contra tu plazo; documentación del producto con quick start probado | — |
| 3. Verify | Tests ocultos, suite completa, seguridad, revisión de código → SHIP / NO SHIP | Solo si algo falla |
| 4. Ship | PR, despliegue con canario y rollback, o documento | **Apruebas** |

Las fases se encadenan solas. `/shipwright:status` te dice cómo va y si llega al plazo; `/shipwright:change` cambia lo aprobado con impacto y aprobación; `/shipwright:retro` (opcional) mejora el framework con lo aprendido.

Lo que no se negocia por velocidad: tests de aceptación escritos por un agente independiente que el builder no puede tocar, TDD, todo en verde antes de integrar, revisión de seguridad de lo sensible, tu aprobación de la spec y de producción.

## Documentación

- [Método](docs/METODO.md) — fases, riesgo, presupuesto, agentes
- [Expertos de ECC por fase](reference/using-ecc.md) · [Catálogo de pruebas](reference/qa-catalog.md) · [Catálogo de stack](docs/catalogo-stack.md)
- [Investigación](docs/investigacion/) — fuentes de cada decisión
- [Changelog](CHANGELOG.md)

Construido sobre [ECC](https://github.com/affaan-m/ecc) (MIT) y [graphify](https://github.com/Graphify-Labs/graphify). Licencia MIT.
