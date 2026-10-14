# Banco de misiones de referencia

Tres misiones fijas para medir si una versión nueva de Shipwright mejora o empeora (`docs/METODO.md` §9).

| Misión | Punto de partida | Qué ejercita |
|---|---|---|
| [01-ai-meeting-summarizer](01-ai-meeting-summarizer/) | Desde cero | App con IA: evals, coste/latencia, interfaz, despliegue |
| [02-booking-api](02-booking-api/) | Desde cero | API con datos, autenticación, roles, carga, seguridad |
| [03-existing-todo-api](03-existing-todo-api/) | Sobre lo existente | Cambio en un repo con tests, convenciones, PR |

## Cómo se ejecuta

1. Copia la carpeta de la misión a un directorio temporal (para la 03, copia `repo/` y trabaja dentro).
2. Ejecuta las fases con la versión de Shipwright que quieres medir, respondiendo la entrevista **solo** con `answers.md`. Lo que `answers.md` no cubra se responde "no sé" (así se mide también la investigación).
3. Al terminar `ship`: `node <shipwright>/scripts/bench.mjs score <carpeta> --out results/<version>-<misión>.json`.
4. Compara contra la versión anterior: `node <shipwright>/scripts/bench.mjs compare results/<antes>.json results/<despues>.json` (sale con código 1 si algo empeora).

Hoy la ejecución es manual porque las fases son interactivas. La v2.0 (orquestador con Claude Agent SDK) la automatizará.
