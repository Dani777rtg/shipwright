# Shipwright

Método spec-driven para cumplir **misiones** de software con IA (Claude Code) en tiempo récord, con calidad profesional de código y documentación, y que **se mejora a sí mismo** después de cada misión.

Una misión puede ser crear algo desde cero (una app en una hackatón) o integrarse en un sistema existente (un empleado al que le piden "añade X"). Todo lo que construyen los agentes se traza a un objetivo claro.

> Spec-driven AI development method for Claude Code. Every mission (greenfield or brownfield) goes mission → intake → architecture → plan → build → verify → ship → retro, with every task traced to an explicit objective. Self-improving through retrospectives, evals and versioned releases.

**Estado:** v0.3.0 — documentación del método. El plugin se construye fase por fase (ver hoja de ruta).

Construido sobre [ECC](https://github.com/affaan-m/ecc) (MIT): usa sus agentes y skills sin modificarlos, siempre sincronizados a su última release, y añade encima el método, las fases, los gates y la trazabilidad. Ver [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md).

## Pipeline

```
MISSION → INTAKE → ARCHITECT → PLAN → BUILD → VERIFY → SHIP → RETRO
 confirma    gate      gate       gate            gate     gate    └─► nueva versión del framework
```

```
/shipwright:mission "añade login con Google al sistema de la empresa"
```

- **Una filosofía:** lo mejor posible en el menor tiempo posible.
- **La profundidad se ajusta sola:** tipo de misión (crear / integrar) × tamaño y riesgo (trivial → grande). Al empezar, te explica qué detectó y qué va a hacer.
- **Nada sin para qué:** misión → objetivos → métricas → calidad → decisiones → tareas → tests. Lo que no sirve a un objetivo se rechaza.
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
