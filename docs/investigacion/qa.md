# QA — investigación de base (2026-10-14)

Fuente del catálogo operativo [`reference/qa-catalog.md`](../../reference/qa-catalog.md) y de la Fase 5 de `METODO.md`.

## Marco
- **ISTQB CTFL 4.0.** Niveles: componente, integración de componentes, sistema, integración de sistemas, aceptación. Tipos: funcional, no funcional, caja negra, caja blanca, confirmación y regresión.
- **ISO/IEC 25010:2023.** 9 características de calidad. Es la base de los QG.
- **ISO/IEC/IEEE 29119-3.** Estrategia y Plan de pruebas con registro de riesgos, e Informe de cierre con riesgos residuales y lecciones.
- **Pruebas basadas en riesgo:** probabilidad × impacto.
- **Forma:** pirámide para backends; trofeo (más integración) para frontends.
- **OWASP ASVS 5.0** para autenticación y autorización, y **OWASP LLM Top 10 2025** para apps con LLM.

## Lo que cubre ECC
Lo que ECC cubre bien:
- TDD por stack.
- E2E con Playwright.
- `browser-qa`: smoke, interacción, visual y axe, con veredicto SHIP/NO SHIP.
- `gan-evaluator`: evaluador independiente sobre la app viva.
- `loop-design-check`: "verde y ningún test debilitado".
- Bucles de verificación: build, tipos, lint, tests, SAST básico y secretos.
- Regresión de bugs con IA.
- Evals de agentes de código.
- Revisión RAG.
- Accesibilidad.
- Contratos por esquema.
- Migraciones.
- Canario.

Lo que **no** cubre: puertas de mutación, Pact/Schemathesis, carga real (estrés, pico, soak), DAST genérico y matriz ASVS, caos, observabilidad como test, ensayo de rollback, evals y red team de apps con LLM, charters exploratorios, usabilidad, documentos 29119, formato de bug y tests de aceptación bloqueados.

## Integridad de tests con agentes de IA
- **ImpossibleBench:** los agentes manipulan tests para pasar. Una instrucción explícita ("la spec manda, no modifiques tests") bajó el cheating del 92% al 1% en uno de los escenarios medidos.
- **Medidas adoptadas en Shipwright:**
  - tests de aceptación escritos por un agente QA independiente;
  - bloqueo por hook, tanto para edición como para consola;
  - huellas SHA-256 verificadas al empezar QA;
  - holdout fuera del repositorio;
  - revisión del diff de tests;
  - cobertura y mutación que no pueden bajar.

## Umbrales
Los umbrales numéricos del catálogo son orientativos: mutación ≥ 70%, faithfulness ≥ 0,8, > 50 usuarios concurrentes para exigir carga. Ninguna norma los fija. La estrategia de cada misión declara los suyos.

## Fuentes
- https://astqb.org/2-2-test-levels-and-test-types/
- https://www.iso.org/es/contents/data/standard/07/81/78176.html
- https://en.wikipedia.org/wiki/ISO/IEC_29119
- https://owasp.org/www-project-application-security-verification-standard/
- https://genai.owasp.org/llm-top-10/
- https://arxiv.org/html/2510.20270v1 (ImpossibleBench) · https://arxiv.org/pdf/2511.21654 (EvilGenie)
- https://anthropic.com/engineering/demystifying-evals-for-ai-agents
- https://www.w3.org/TR/WCAG22/ · https://web.dev/articles/vitals
- https://martinfowler.com/articles/practical-test-pyramid.html · https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- Versiones de herramientas: releases de GitHub y registros PyPI/npm/NuGet, consultados el 2026-10-14.
