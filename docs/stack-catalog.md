# Stack catalog

Decision guide for the Spec phase. The stack is chosen **per project** and justified in the Decisions section of the spec. This catalog is updated at every retro.

Data verified as of 2026-10-13 (see [`research/agent-frameworks.md`](research/agent-frameworks.md)).

Each chosen option installs **only** its packs in the project (rules, skills and reviewers, mostly from ECC). They are installed when the spec is approved with `install-packs.mjs --stack` (`reference/stack-packs.json`).

## General rules

1. Prefer what the team/jury/client already uses.
2. Prefer a single language across the project if possible.
3. Start with the lightest SDK that solves the problem; move up to an orchestrator only if you need state, HITL or real multi-agent.
4. Default database: PostgreSQL (or SQLite for hackathon/local).

## By project type

| Type | Default option | Alternative | When to switch |
|---|---|---|---|
| Web app / SaaS | Next.js (TS) + Postgres | SvelteKit; Django if the team is Python | Team or client with a fixed stack |
| API / backend | FastAPI (Py) or Hono/Node (TS) | Go if there are strong performance requirements | — |
| Mobile | React Native (Expo) | Flutter | Heavy native requirements → native |
| Desktop | Tauri | Electron | Need for the full Node ecosystem → Electron |
| Web app with AI (chat, streaming, tools) | Vercel AI SDK | + Mastra if there are workflows or memory | — |
| RAG / chat with documents | LlamaIndex (Py) | Pydantic AI for typed outputs | — |
| Quick multi-agent demo | CrewAI (Py) / Mastra (TS) | — | You need fine control → LangGraph |
| Multi-agent with control, state and human approval | LangGraph | Microsoft Agent Framework (.NET/Azure) | — |
| Agent that edits files / runs code | Claude Agent SDK | OpenAI Agents SDK (remote sandbox) | Model provider imposed |
| Python backend with validated outputs | Pydantic AI | — | — |
| Google-sponsored hackathon | Google ADK + Gemini | — | — |
| Microsoft-sponsored hackathon | Microsoft Agent Framework | — | — |

## Quick profiles

| Framework | Language | Status (Oct 2026) | Strong at | Weak at |
|---|---|---|---|---|
| LangGraph | Py, TS | 1.x stable | State, checkpoints, HITL | Verbose, steep learning curve |
| CrewAI | Py | 1.x | Role-based multi-agent prototype | Little control, frequent changes |
| LlamaIndex | Py, TS | core 0.x, Workflows 1.0 | Ingestion, indexes, RAG | General orchestration |
| Microsoft Agent Framework | .NET, Py | 1.0 GA Apr 2026 (merger of Semantic Kernel + AutoGen) | Enterprise, LTS, Azure | Heavy for a hackathon |
| Mastra | TS | 1.0 Jan 2026 | Agents + workflows + memory + evals in TS | TS only, young ecosystem |
| OpenAI Agents SDK | Py, TS | 0.x | Minimalist, sandbox/shell since Apr 2026 | 0.x, OpenAI bias |
| Claude Agent SDK | Py, TS | 0.x | Full coding-agent harness | Claude models only, 0.x |
| Google ADK | Py, TS, Go, Java | 2.x GA | Multi-language, Gemini/Vertex | Recent 1.x→2.x change |
| Pydantic AI | Py | 2.x | Typing and validation | Limited multi-agent |
| Vercel AI SDK | TS | 7.x | Streaming and UI in React/Next | Does not orchestrate (use Mastra on top) |
