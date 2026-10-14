# AI agent frameworks — comparison (2026-10-13)

> Main conclusion: these frameworks are for building AI **products** (stack) or a custom **orchestrator** (Shipwright v2). They are not the development methodology itself.

## Verification of initial claims

- **Microsoft Agent Framework = Semantic Kernel + AutoGen:** true. 1.0 GA on 3 Apr 2026 (.NET and Python); SK and AutoGen move to maintenance. The public preview existed before April. New features (A2A) are still in preview. PyPI `agent-framework` 1.21.0 (8 Oct 2026).
- **Mastra 1.0 stable in January 2026:** true (announced 20 Jan 2026). `@mastra/core` 1.76.0.
- **Claude Agent SDK with file/shell tools:** true (Read/Write/Edit/Bash/Grep/Web, hooks, permissions, resume/fork sessions, subagents, MCP). Still 0.x and only uses Claude models.
- **"Start with lightweight SDKs before complex orchestrators":** advice consistent with what was observed; adopted as a rule in the stack catalog.

## Table

| Framework | Language | Version | Core abstraction | Built-in files/shell | HITL / persistence |
|---|---|---|---|---|---|
| LangGraph | Py, TS | 1.2.x (1.0 Oct 2025) | State graph | No | `interrupt` + checkpointer (the most mature) |
| CrewAI | Py | 1.15.x | Crews (roles) + Flows | No | Stateful Flows, basic HITL |
| LlamaIndex | Py, TS | core 0.14.x, Workflows 1.0 | Indexes/RAG + event-driven workflows | No | Serializable context |
| Microsoft Agent Framework | .NET, Py | 1.21.0 | Agent + graph workflows | Via MCP | Checkpoints, approvals |
| Mastra | TS | 1.76.0 | Agents + workflows + memory | No | suspend/resume |
| OpenAI Agents SDK | Py, TS | 0.23.x | Agent, handoffs, guardrails, sessions | Yes (since Apr 2026) | Sessions, approvals |
| Claude Agent SDK | Py, TS | 0.2.x | Claude Code loop as a library | Yes | Permissions, hooks, sessions |
| Google ADK | Py, TS, Go, Java | 2.x | Agents + workflows + graphs | No (code execution yes) | Confirmation, sessions, rewind |
| Pydantic AI | Py | 2.x | Typed agent | No | Deferred approval |
| Vercel AI SDK | TS | 7.x | generateText/streamText, ToolLoopAgent | No | `needsApproval` |

## Recommendations

**A — Runtime for Shipwright's v2 orchestrator:** Claude Agent SDK to execute (code, tests, files) + LangGraph on top for phases, state and `interrupt()` at gates. An MVP is possible with the Claude Agent SDK alone.

**B — Product stack:** see [`../stack-catalog.md`](../stack-catalog.md).

## Not verified
Exact PyPI/npm release dates (except MAF), ADK 2.0 GA date (contradictory sources), MAF preview date.

## Sources
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
