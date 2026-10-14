# Shipwright

Método spec-driven para cumplir **misiones** de software con IA (Claude Code) en tiempo récord, con calidad profesional de código y documentación, y que **se mejora a sí mismo** después de cada misión.

Una misión puede partir desde cero (una app en una hackatón) o sobre un sistema existente (un empleado al que le piden "añade X"). Todo lo que construyen los agentes se traza a un objetivo claro.

> Spec-driven AI development method for Claude Code. Every mission (greenfield or brownfield) goes mission → intake → architecture → plan → build → verify → ship → retro, with every task traced to an explicit objective. Self-improving through retrospectives, evals and versioned releases.

**Estado:** v0.6.0 — instalable. Funcionan `/shipwright:mission` e `/shipwright:intake`; las demás fases llegan en las siguientes versiones (ver hoja de ruta).

Construido sobre [ECC](https://github.com/affaan-m/ecc) (MIT): incluye todo su catálogo de desarrollo sin modificarlo, cargado bajo demanda mediante un índice y sincronizado con cada release (vía pull request revisado), y añade encima el método, las fases, los gates y la trazabilidad. Ver [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md).

## Pipeline

```
MISSION → INTAKE → ARCHITECT → PLAN → BUILD → QA → SHIP → RETRO
 confirma   gate      gate       gate          gate  gate     └─► nueva versión del framework
```

```
/shipwright:mission "añade login con Google al sistema de la empresa"
```

- **Un solo método, siempre completo:** lo mejor posible en el menor tiempo posible, sin recortes. Todas las fases, todas las preguntas, todos los artefactos; lo que no aplica se marca y se justifica, nunca se omite en silencio.
- **Una sola distinción:** desde cero o sobre lo existente. Al empezar, te explica qué detectó y qué va a hacer.
- **Nada sin para qué:** misión → objetivos → métricas → calidad → decisiones → tareas → tests. Lo que no sirve a un objetivo se rechaza.
- **QA independiente:** un agente QA, separado de quien programa, revisa la testabilidad, escribe y bloquea los tests de aceptación antes de construir, evalúa todos los tipos de prueba pertinentes (carga, estrés, seguridad, accesibilidad, evals de IA…) y da el veredicto SHIP / NO SHIP.
- Puertas de aprobación humana entre fases.
- [graphify](https://github.com/Graphify-Labs/graphify) como memoria en todas las fases.

## Instalación

En Claude Code:

```
/plugin marketplace add Dani777rtg/shipwright
/plugin install shipwright@shipwright
```

(En Claude Code 2.1.275 o posterior también: `/plugin install shipwright --marketplace Dani777rtg/shipwright`.)

Requisitos: git, Node 18+, Python 3.10+ con `pip install graphifyy`.

## Uso

```
/shipwright:mission "app de IA que resume reuniones, hackatón de 24 h"
/shipwright:intake
```

`mission` detecta si partes desde cero o sobre un sistema existente, te explica el plan completo y espera tu confirmación. `intake` analiza el material (y tu código, si aplica) con graphify, te entrevista con la checklist completa y escribe los objetivos y requisitos trazados.

## Documentación

- [Método completo](docs/METODO.md)
- [Catálogo de stack](docs/catalogo-stack.md)
- [Investigación](docs/investigacion/)
- [Lecciones aprendidas](lessons/LESSONS.md)
- [Changelog](CHANGELOG.md)

## Licencia

MIT
