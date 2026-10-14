# Spec-driven methodologies with AI agents (2026-10-13)

> Reliability: most sources are third-party; stars are approximate snapshots; command names change between versions.

## Table

| Method | Phases / artifacts | Requirements | Architecture | Tasks | Verification | Self-improvement | Claude Code? |
|---|---|---|---|---|---|---|---|
| GitHub Spec Kit (~125k★) | constitution → specify → clarify → plan → tasks → analyze → implement | Stories without technology; `clarify` asks about ambiguities | plan.md + data-model + contracts, against constitution gates | `T001 [P] [US1] path` | Gates, `analyze`, checklists | Hand-editable constitution | Yes |
| BMAD v6 (~51k★) | Analyst → PM → Architect → SM → Dev → QA; Quick Flow / Method / Enterprise | Brainstorming + PRD with epics | architecture.md | Self-contained stories | QA + tests | Epic retro | Yes |
| AWS Kiro | steering + requirements/design/tasks.md | Stories + **EARS** | design.md with diagrams | Traced checklist | Testable EARS criteria | Editable steering | Not native (cc-sdd clones it) |
| Agent OS v3 | product → spec → tasks → implement → verify; focus on *standards* | Shaping questions | tech-stack + standards | tasks.md | Verification per step | Discovers standards from code | Yes |
| Native Claude Code | CLAUDE.md, memory, skills, commands, subagents, hooks, plugins, plan mode, AskUserQuestion | Plan mode + AskUserQuestion | Free | TodoWrite | Hooks + reviewer subagents | Auto-memory, skill-creator with evals | — |
| SuperClaude | `/sc:*` commands, personas | `/sc:brainstorm` | Architect persona | `/sc:task` | QA persona | Partial | Yes (uses a lot of context) |
| Superpowers (~265k★) | brainstorm → worktree → plan → subagent-driven dev → TDD → review → finish | Socratic, one question at a time | Design doc | 2–5 min tasks with verification | Strict TDD + review between tasks | `writing-skills`, transcript diagnosis | Yes (plugin) |
| Taskmaster AI | PRD → parse → complexity → expand → next | Manual PRD | — | Dependency graph + complexity 1–10 | testStrategy per task | — | Yes (MCP) |
| OpenSpec | `specs/` (truth) + `changes/` (deltas) → propose → apply → archive | WHEN/THEN | Optional design.md | tasks.md | Delta validation | Living spec | Yes |
| GSD | `.planning/` PROJECT/REQUIREMENTS/ROADMAP/STATE; discuss → plan → execute → verify | Questions + research | map-codebase | Plan per phase in a fresh subagent | Verify per phase | STATE.md | Yes |
| Compound Engineering (Every) | brainstorm → plan → work → review → **compound** | Brainstorm | Technical plan | Worktrees | Many specialist reviewers | `/ce:compound` → docs/solutions + CLAUDE.md | Yes |
| Tessl | Spec-as-source | Markdown specs | — | — | Tests tied to spec | Registry of scored skills | Via MCP |

Taxonomy (Böckeler, martinfowler.com): spec-first (Spec Kit, Kiro), spec-anchored (OpenSpec), spec-as-source (Tessl). **Shipwright = spec-anchored**: the spec lives and evolves with the project.

## Best practices

**Requirements interview:** one question at a time, neutral, unbiased; ask follow-ups only to clarify; stop at ~95% confidence; return a summary for validation. Typical mistakes of LLM interviewers: poorly worded questions, omitted topics, wrong order (LLMREI). Follow-up questions guided by a list of known mistakes outperform humans (arXiv 2507.02858). Output: stories + EARS + out of scope + assumptions.

**Architecture for LLMs:** Markdown + Mermaid; ADRs in MADR (one per file, numbered, with status); C4 only levels 1–2; arc42 as the skeleton, `TBD` instead of inventing.

**Self-improvement:** a compound/reflect step after each cycle with human approval; lessons as skills, not by bloating CLAUDE.md; skill evals with and without the change; transcript diagnosis; periodic pruning and size limits.

## Sources
- https://github.com/github/spec-kit
- https://www.augmentcode.com/guides/bmad-method-ai-development
- https://kiro.dev/docs/specs/concepts
- https://buildermethods.com/agent-os/v2/version-2
- https://github.com/obra/superpowers
- https://docs.task-master.dev/command-reference
- https://openspec.dev/docs/getting-started
- https://www.mintlify.com/gsd-build/get-shit-done/concepts/context-engineering
- https://every.to/guides/compound-engineering
- https://www.martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
- https://arxiv.org/abs/2507.02858
- https://arxiv.org/pdf/2410.01824
- https://towardsdatascience.com/how-i-continually-improve-my-claude-code/
