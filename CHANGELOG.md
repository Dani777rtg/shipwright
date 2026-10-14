# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado: semver (ver `docs/METODO.md` §9).
Cada entrada originada por una retro cita el proyecto de origen.

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
