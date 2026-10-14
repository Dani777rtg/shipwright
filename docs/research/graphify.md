# graphify — reference for Shipwright

Package `graphifyy` (v0.9.35 tested), https://github.com/Graphify-Labs/graphify. Claude Code skill: `/graphify`.

## What it does
Folder (code, docs, PDF, images, audio/video) → knowledge graph: detection → extraction → build (NetworkX) → communities → analysis (god nodes, surprising connections, suggested questions) → exports.

- Code: AST, deterministic, no LLM, free.
- Docs/PDF/images: semantic extraction with Claude Code subagents (batches of ~22 files, ~45 s per batch) or Gemini if `GEMINI_API_KEY` is set.
- Labeled edges: `EXTRACTED`, `INFERRED` (with `confidence_score`), `AMBIGUOUS`.

## Outputs (`graphify-out/`)
`graph.html`, `graph.json` (GraphRAG), `GRAPH_REPORT.md`, `cost.json`, cache; optional obsidian/wiki/svg/graphml/cypher; `memory/` and `reflections/LESSONS.md`.

## Useful commands
```
/graphify <path> [--mode deep] [--update] [--directed] [--obsidian] [--mcp] [--watch]
/graphify add <url>
/graphify query "question" [--budget 1500]
/graphify path "A" "B"
/graphify explain "Node"
graphify update .                      # code only, no LLM
graphify affected "X" --depth 2        # impact
graphify god-nodes --top 10
graphify hook install                  # rebuilds the AST on every commit
graphify global add graphify-out/graph.json --as project
graphify save-result --question ... --outcome useful|dead_end|corrected --correction "..."
graphify reflect                       # generates LESSONS.md
graphify merge-graphs a.json b.json --out c.json
```

## Gotchas
- `query` matches literal substrings: query language = label language.
- Hook/`--watch` only update code; docs require `/graphify --update`.
- It refuses to write a graph smaller than the previous one: use `--force` after deleting files.
- Extraction subagents must be `general-purpose` (Explore drops chunks).
- Multiple subfolders overwrite `graphify-out/`: use `graphify extract` + `merge-graphs`.
- `--mode deep` adds noise: filter `INFERRED` by confidence.
- PowerShell 5.1: use Windows Terminal (ANSI).
- `global` and `reflect` do not summarize on their own: quality depends on `save-result`.

Usage by phase: see `../METHOD.md` §8.
