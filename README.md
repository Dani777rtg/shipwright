# Shipwright

Método spec-driven para construir software con IA (Claude Code) en tiempo récord, con calidad profesional de código y documentación, y que **se mejora a sí mismo** después de cada proyecto.

> Spec-driven AI development method for Claude Code: requirements interview → architecture → plan → build → verify → ship → retro. Self-improving through per-project retrospectives, evals and versioned releases.

**Estado:** v0.1.0 — documentación del método. El plugin se construye fase por fase (ver hoja de ruta).

## Pipeline

```
SETUP → INTAKE → ARCHITECT → PLAN → BUILD → VERIFY → SHIP → RETRO
         gate      gate       gate            gate     gate    └─► nueva versión del framework
```

- Dos modos: `hackathon` (rápido) y `client` (riguroso). Mismo camino, distinta profundidad.
- Puertas de aprobación humana entre fases.
- [graphify](https://github.com/Graphify-Labs/graphify) como memoria en todas las fases.

## Documentación

- [Método completo](docs/METODO.md)
- [Catálogo de stack](docs/catalogo-stack.md)
- [Investigación](docs/investigacion/)
- [Lecciones aprendidas](lessons/LESSONS.md)
- [Changelog](CHANGELOG.md)

## Requisitos

- [Claude Code](https://claude.com/claude-code)
- Python 3.10+ y `pip install graphifyy`
- git

## Licencia

MIT
