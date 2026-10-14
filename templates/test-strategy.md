---
status: draft
---
# Estrategia de pruebas — <misión>

> ISO/IEC/IEEE 29119-3. Catálogo de tipos y criterios: `reference/qa-catalog.md` del plugin.

## 1. Perfil del proyecto

| Característica | Valor | Evidencia |
|---|---|---|
| Interfaz de usuario (web / móvil / escritorio / ninguna) | | |
| API (HTTP / GraphQL / otra / ninguna) | | |
| Base de datos persistente | | |
| Usa LLM / es un agente / RAG | | |
| Datos personales, salud o pagos | | |
| Usuarios concurrentes esperados | | |
| Idiomas / mercados | | |
| Artefacto desplegable | | |
| Stack y herramientas de test existentes | | |

## 2. Registro de riesgos

| Riesgo | Probabilidad (1–3) | Impacto (1–3) | Prioridad | Objetivos afectados (QG/QS/AC) | Tipos de prueba que lo cubren |
|---|---|---|---|---|---|
| | | | | | |

## 3. Tipos de prueba

<!-- TODOS los tipos del catálogo aparecen aquí: pertinente con motivo, o "No aplica: <motivo>". -->

| Tipo | Pertinente | Motivo / riesgo / ID que cubre | Herramienta | Umbral de salida |
|---|---|---|---|---|
| Unitarias | Sí | | | |
| Componente (UI) | | | | |
| Integración | | | | |
| Contrato | | | | |
| API | | | | |
| Aceptación (bloqueadas) | Sí | Un test o más por AC | | 100% verde |
| E2E | | | | |
| Regresión visual | | | | |
| Suite de regresión | Sí | | | |
| Smoke | | | | |
| Exploratorias con IA | | | | |
| Basadas en propiedades | | | | |
| Fuzzing | | | | |
| Mutación | | | | |
| Carga | | | | |
| Estrés | | | | |
| Pico | | | | |
| Soak / resistencia | | | | |
| Escalabilidad | | | | |
| Rendimiento web | | | | |
| SAST | Sí | | | |
| Dependencias (SCA) | Sí | | | |
| Secretos | Sí | | | |
| DAST | | | | |
| Autenticación / autorización | | | | |
| Accesibilidad | | | | |
| Usabilidad | | | | |
| Compatibilidad | | | | |
| i18n / l10n | | | | |
| Datos / migración | | | | |
| Resiliencia / caos | | | | |
| Despliegue / rollback | | | | |
| Observabilidad | | | | |
| Cumplimiento / privacidad | | | | |
| Evals de LLM | | | | |
| Calidad RAG | | | | |
| Alucinación | | | | |
| Inyección de prompt / red team | | | | |
| Coste / latencia de IA | | | | |
| Trayectoria de agente | | | | |

## 4. Demostración de los escenarios de calidad

| QS | Tipo de prueba | Herramienta | Medida esperada |
|---|---|---|---|
| | | | |

## 5. Niveles, forma y entornos

- Forma: pirámide / trofeo — motivo:
- Entornos (local, CI, staging, producción):
- Datos de prueba (origen, anonimización, reinicio):
- Ruta de los tests de aceptación (bloqueada): `tests/acceptance/`

## 6. Criterios de entrada y salida de la fase QA

- Entrada: build en verde, todas las tareas cerradas, `lock.mjs verify` sin cambios.
- Salida: criterios de salida de `reference/qa-catalog.md` con los umbrales de esta misión:
