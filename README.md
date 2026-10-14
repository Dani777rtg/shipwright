# Shipwright

Plugin de Claude Code para construir software con IA **siguiendo un método**, no prompts sueltos: entiende el encargo, diseña, construye, prueba, asegura y despliega a producción, y mejora el propio método después de cada proyecto.

> Claude Code plugin: a spec-driven method that takes a brief to production — requirements, architecture, build, QA, security and deployment — with every task traced to an objective.

**Estado:** v0.13 — las 8 fases, `change` y `status` están implementadas; falta validarlas en misiones reales antes de la v1.0 ([hoja de ruta](docs/METODO.md#hoja-de-ruta)).

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

Comprueba escribiendo `/shipwright`: deben aparecer `/shipwright:mission`, `/shipwright:intake`… Si no, ejecuta `/reload-plugins`.

Requisitos: git, Node 18+, Python 3.10+ con `pip install graphifyy`.

## Usar

```
/shipwright:mission "app de IA que resume reuniones, hackatón de 24 h"
/shipwright:intake
```

Si el encargo viene en documentos (PDF, notas, transcripciones), pasa su ruta: `/shipwright:mission "C:\carpeta\encargo.md"`. Shipwright lo lee entero y lo guarda en la carpeta de la misión.

Sirve igual para crear algo **desde cero** que para cambiar un **sistema existente** (por ejemplo, "añade login con Google a nuestra app").

## Qué hace

| Fase | Resultado |
|---|---|
| 1. Mission | Clasifica el encargo, explica el plan y pide confirmación |
| 2. Intake | Entrevista completa → objetivos medibles y requisitos verificables |
| 3. Architect | Arquitectura, decisiones, modelo de amenazas, estrategias de pruebas, despliegue y documentación, prototipo de interfaz |
| 4. Plan | Tareas pequeñas; QA escribe y bloquea los tests de aceptación |
| 5. Build | Un subagente por tarea, tests primero |
| 6. QA | Todas las pruebas pertinentes (funcionales, carga, seguridad, accesibilidad, IA) → SHIP / NO SHIP |
| 7. Ship | Despliegue a producción en tu plataforma, verificado y con rollback; repo documentado y documento de entrega |
| 8. Retro | Lecciones → nueva versión del framework |

Reglas que no se negocian:
- **Todo tiene un para qué:** cada tarea y test cita el objetivo al que sirve; lo que no sirve se rechaza.
- **Tú apruebas cada fase.**
- **QA, seguridad, producción, documentación y UX** a cargo de agentes independientes de quien programa; los tests de aceptación no se pueden alterar.
- **Listo = funcionando en producción y documentado**, no "compila en mi máquina".

## Modelos, sesiones y complementos

- Cada agente usa el modelo de su rol (Opus para juicio, Sonnet para construir, Haiku para reportes). Para forzar otro: variables `CLAUDE_CODE_SUBAGENT_MODEL` y `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`.
- Al cerrar cada fase, Shipwright te recomienda `/clear`: todo está en archivos y se restaura solo.
- Complementos opcionales (caveman, ponytail, context7, playwright, Trail of Bits…): [reference/companions.md](reference/companions.md).

## Documentación

- [Método](docs/METODO.md) — cómo funciona cada fase
- [Catálogo de pruebas](reference/qa-catalog.md) · [Catálogo de stack](docs/catalogo-stack.md)
- [Investigación](docs/investigacion/) — fuentes de cada decisión
- [Changelog](CHANGELOG.md)

Construido sobre [ECC](https://github.com/affaan-m/ecc) (MIT) y [graphify](https://github.com/Graphify-Labs/graphify). Licencia MIT.
