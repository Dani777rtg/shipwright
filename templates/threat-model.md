---
status: draft
---
# Modelo de amenazas — <misión>

## 1. Alcance

| Campo | Valor |
|---|---|
| Clase de datos | pública · interna · personal · pagos · salud |
| Nivel ASVS | L1 · L2 · L3 — ADR-… |
| Perfiles | web · API · BD · auth · pagos/datos personales · LLM/agente · móvil · nube |
| Jurisdicciones | |

## 2. Modelo del sistema

- Diagrama: C4 L1/L2 de `ARCHITECTURE.md` (o flujo de datos).
- Activos:
- Actores (legítimos y atacantes):
- Fronteras de confianza: navegador↔API, API↔BD, app↔proveedor LLM, agente↔herramientas/MCP, CI↔registro de paquetes, …

## 3. Amenazas

<!-- Categorías STRIDE: suplantación, manipulación, repudio, revelación de información, denegación de servicio, elevación de privilegios.
     LLM/agentes: inyección de prompt directa/indirecta, salida insegura, agencia excesiva, envenenamiento de datos/memoria,
     fuga de prompt o datos, fuga entre tenants en vector store, consumo ilimitado, cadena de suministro (modelos, paquetes, MCP).
     Cada amenaza es un ítem de lista con ID para que shipwright trace la siga; las tareas que la mitigan citan "serves: TM-n". -->

- TM-1: <elemento/frontera> · <categoría> · <escenario> · probabilidad <1–3> × impacto <1–3> · mitigación: <AC/QS/ADR> · estado: abierta
- TM-2: …

## 4. Casos de abuso (como criterios EARS)

- IF <atacante hace X> THEN THE SYSTEM SHALL <respuesta> → AC-…

## 5. Suposiciones y riesgos aceptados

<!-- Riesgo aceptado: <TM-n>, <quién lo acepta>, <motivo>, <fecha de revisión>. -->

## 6. Disparadores de revisión

Nueva frontera de confianza, dependencia o clase de datos → `/shipwright:change` actualiza este modelo.
