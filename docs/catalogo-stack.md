# Catálogo de stack

Guía de decisión para la fase 2 (Architect). El stack se elige **por proyecto** y se justifica en un ADR. Este catálogo se actualiza en cada retro.

Datos verificados a 2026-10-13 (ver [`investigacion/frameworks-agentes.md`](investigacion/frameworks-agentes.md)).

Cada opción elegida instala en el proyecto **solo** sus packs (reglas, skills y revisores, en su mayoría de ECC). Ver `METODO.md` §9.

## Reglas generales

1. Preferir lo que el equipo/jurado/cliente ya usa.
2. Preferir un solo lenguaje en todo el proyecto si es posible.
3. Empezar con el SDK más ligero que resuelva el problema; subir a un orquestador solo si hace falta estado, HITL o multiagente real.
4. Base de datos por defecto: PostgreSQL (o SQLite para hackatón/local).

## Por tipo de proyecto

| Tipo | Opción por defecto | Alternativa | Cuándo cambiar |
|---|---|---|---|
| Web app / SaaS | Next.js (TS) + Postgres | SvelteKit; Django si el equipo es Python | Equipo o cliente con stack fijo |
| API / backend | FastAPI (Py) o Hono/Node (TS) | Go si hay requisitos fuertes de rendimiento | — |
| Móvil | React Native (Expo) | Flutter | Requisitos nativos pesados → nativo |
| Escritorio | Tauri | Electron | Necesidad de ecosistema Node completo → Electron |
| App web con IA (chat, streaming, tools) | Vercel AI SDK | + Mastra si hay workflows o memoria | — |
| RAG / chatear con documentos | LlamaIndex (Py) | Pydantic AI para salidas tipadas | — |
| Multiagente demo rápida | CrewAI (Py) / Mastra (TS) | — | Necesitas control fino → LangGraph |
| Multiagente con control, estado y aprobación humana | LangGraph | Microsoft Agent Framework (.NET/Azure) | — |
| Agente que edita archivos / ejecuta código | Claude Agent SDK | OpenAI Agents SDK (sandbox remoto) | Proveedor de modelo impuesto |
| Backend Python con salidas validadas | Pydantic AI | — | — |
| Hackatón patrocinada por Google | Google ADK + Gemini | — | — |
| Hackatón patrocinada por Microsoft | Microsoft Agent Framework | — | — |

## Fichas rápidas

| Framework | Lenguaje | Estado (oct-2026) | Fuerte en | Débil en |
|---|---|---|---|---|
| LangGraph | Py, TS | 1.x estable | Estado, checkpoints, HITL | Verboso, curva alta |
| CrewAI | Py | 1.x | Prototipo multiagente por roles | Poco control, cambios frecuentes |
| LlamaIndex | Py, TS | core 0.x, Workflows 1.0 | Ingesta, índices, RAG | Orquestación general |
| Microsoft Agent Framework | .NET, Py | 1.0 GA abr-2026 (fusión Semantic Kernel + AutoGen) | Empresa, LTS, Azure | Pesado para hackatón |
| Mastra | TS | 1.0 ene-2026 | Agentes + workflows + memoria + evals en TS | Solo TS, ecosistema joven |
| OpenAI Agents SDK | Py, TS | 0.x | Minimalista, sandbox/shell desde abr-2026 | 0.x, sesgo OpenAI |
| Claude Agent SDK | Py, TS | 0.x | Harness completo de agente de código | Solo modelos Claude, 0.x |
| Google ADK | Py, TS, Go, Java | 2.x GA | Multilenguaje, Gemini/Vertex | Cambio 1.x→2.x reciente |
| Pydantic AI | Py | 2.x | Tipado y validación | Multiagente limitado |
| Vercel AI SDK | TS | 7.x | Streaming y UI en React/Next | No orquesta (usar Mastra encima) |
