# Frameworks de agentes IA — comparativa (2026-10-13)

> Conclusión principal: estos frameworks sirven para construir **productos** con IA (stack) o un **orquestador** propio (v2 de Shipwright). No son la metodología de desarrollo en sí.

## Verificación de afirmaciones iniciales

- **Microsoft Agent Framework = Semantic Kernel + AutoGen:** verdadero. 1.0 GA el 3-abr-2026 (.NET y Python); SK y AutoGen pasan a mantenimiento. La preview pública existía antes de abril. Funciones nuevas (A2A) siguen en preview. PyPI `agent-framework` 1.21.0 (8-oct-2026).
- **Mastra 1.0 estable en enero 2026:** verdadero (anuncio 20-ene-2026). `@mastra/core` 1.76.0.
- **Claude Agent SDK con herramientas de archivos/shell:** verdadero (Read/Write/Edit/Bash/Grep/Web, hooks, permisos, sesiones resume/fork, subagentes, MCP). Sigue en 0.x y solo usa modelos Claude.
- **"Empezar con SDKs ligeros antes de orquestadores complejos":** consejo coherente con lo observado; adoptado como regla en el catálogo de stack.

## Tabla

| Framework | Lenguaje | Versión | Abstracción central | Archivos/shell integrados | HITL / persistencia |
|---|---|---|---|---|---|
| LangGraph | Py, TS | 1.2.x (1.0 oct-2025) | Grafo de estado | No | `interrupt` + checkpointer (la más madura) |
| CrewAI | Py | 1.15.x | Crews (roles) + Flows | No | Flows con estado, HITL básico |
| LlamaIndex | Py, TS | core 0.14.x, Workflows 1.0 | Índices/RAG + workflows por eventos | No | Contexto serializable |
| Microsoft Agent Framework | .NET, Py | 1.21.0 | Agent + workflows de grafo | Vía MCP | Checkpoints, aprobaciones |
| Mastra | TS | 1.76.0 | Agents + workflows + memoria | No | suspend/resume |
| OpenAI Agents SDK | Py, TS | 0.23.x | Agent, handoffs, guardrails, sessions | Sí (desde abr-2026) | Sessions, aprobaciones |
| Claude Agent SDK | Py, TS | 0.2.x | Bucle de Claude Code como librería | Sí | Permisos, hooks, sesiones |
| Google ADK | Py, TS, Go, Java | 2.x | Agents + workflows + grafos | No (ejecución de código sí) | Confirmación, sesiones, rewind |
| Pydantic AI | Py | 2.x | Agent tipado | No | Aprobación diferida |
| Vercel AI SDK | TS | 7.x | generateText/streamText, ToolLoopAgent | No | `needsApproval` |

## Recomendaciones

**A — Runtime para el orquestador v2 de Shipwright:** Claude Agent SDK para ejecutar (código, tests, archivos) + LangGraph encima para fases, estado y `interrupt()` en gates. MVP posible solo con Claude Agent SDK.

**B — Stack de productos:** ver [`../catalogo-stack.md`](../catalogo-stack.md).

## No verificado
Fechas exactas de releases PyPI/npm (salvo MAF), fecha de ADK 2.0 GA (fuentes contradictorias), fecha de preview de MAF.

## Fuentes
- https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/
- https://visualstudiomagazine.com/articles/2026/04/06/microsoft-ships-production-ready-agent-framework-1-0-for-net-and-python.aspx
- https://pypi.org/project/agent-framework/
- https://mastra.ai/categories/announcements
- https://www.npmjs.com/package/@mastra/core
- https://docs.langchain.com/oss/javascript/releases/langgraph-v1
- https://pypi.org/project/langgraph/
- https://docs.crewai.com/en/changelog.md
- https://www.llamaindex.ai/blog/announcing-workflows-1-0-a-lightweight-framework-for-agentic-systems
- https://openai.com/index/the-next-evolution-of-the-agents-sdk/
- https://code.claude.com/docs/en/agent-sdk/overview
- https://adk.dev/
- https://pypi.org/project/pydantic-ai/
- https://www.npmjs.com/package/ai
