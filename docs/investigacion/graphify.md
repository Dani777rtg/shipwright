# graphify — referencia para Shipwright

Paquete `graphifyy` (v0.9.35 probada), https://github.com/Graphify-Labs/graphify. Skill de Claude Code: `/graphify`.

## Qué hace
Carpeta (código, docs, PDF, imágenes, audio/video) → grafo de conocimiento: detección → extracción → construcción (NetworkX) → comunidades → análisis (god nodes, conexiones sorprendentes, preguntas sugeridas) → exports.

- Código: AST, determinista, sin LLM, gratis.
- Docs/PDF/imágenes: extracción semántica con subagentes de Claude Code (lotes de ~22 archivos, ~45 s por tanda) o Gemini si hay `GEMINI_API_KEY`.
- Aristas etiquetadas: `EXTRACTED`, `INFERRED` (con `confidence_score`), `AMBIGUOUS`.

## Salidas (`graphify-out/`)
`graph.html`, `graph.json` (GraphRAG), `GRAPH_REPORT.md`, `cost.json`, caché; opcional obsidian/wiki/svg/graphml/cypher; `memory/` y `reflections/LESSONS.md`.

## Comandos útiles
```
/graphify <path> [--mode deep] [--update] [--directed] [--obsidian] [--mcp] [--watch]
/graphify add <url>
/graphify query "pregunta" [--budget 1500]
/graphify path "A" "B"
/graphify explain "Nodo"
graphify update .                      # solo código, sin LLM
graphify affected "X" --depth 2        # impacto
graphify god-nodes --top 10
graphify hook install                  # reconstruye AST en cada commit
graphify global add graphify-out/graph.json --as proyecto
graphify save-result --question ... --outcome useful|dead_end|corrected --correction "..."
graphify reflect                       # genera LESSONS.md
graphify merge-graphs a.json b.json --out c.json
```

## Gotchas
- `query` es por subcadena literal: idioma de la consulta = idioma de las etiquetas.
- Hook/`--watch` solo actualizan código; docs requieren `/graphify --update`.
- Se niega a escribir un grafo más pequeño que el anterior: tras borrar archivos usar `--force`.
- Subagentes de extracción deben ser `general-purpose` (Explore pierde chunks).
- Varias subcarpetas sobrescriben `graphify-out/`: usar `graphify extract` + `merge-graphs`.
- `--mode deep` mete ruido: filtrar `INFERRED` por confianza.
- PowerShell 5.1: usar Windows Terminal (ANSI).
- `global` y `reflect` no resumen solos: la calidad depende de `save-result`.

Uso por fase: ver `../METODO.md` §7.
