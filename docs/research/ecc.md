# ECC (affaan-m/ecc) — analysis as a base for Shipwright (2026-10-13)

Repo: https://github.com/affaan-m/ecc · version 2.2.3 (2026-10-01) · last commit analyzed 2026-10-11 · **MIT** license (© Affaan Mustafa).
Read-only analysis (nothing from the repo was run).

## What it is
"Agent harness operating system": 71 agents, 311 skills, 97 commands (mostly *legacy shims*), 27 hooks, 22 per-language rule packs, MCP configs. Claude Code plugin + adapters for ~15 harnesses (Codex, Cursor, Gemini, OpenCode, Kiro…). ~103 MB. A single maintainer, ~450 commits/month. Commercial side (ECC Pro, sponsors).
Philosophy: agent-first, TDD (80% coverage), security-first, plan before execute.
`ecc2/`: control plane in Rust (alpha), no immediate use.

## Problems with using it as is
- **Context:** skill descriptions ≈ 25k tokens + agents ≈ 4k, always loaded; about half of the skills are unrelated to development (trading, logistics, marketing…).
- **Routing:** its `/plan`, `planner`, `tdd-guide` would compete with our phases.
- **Heavy hooks:** they fire on every tool use; double node spawn per hook; Stop with 300 s timeout; GateGuard costs 35–45% more turns with no demonstrated benefit (their own study).
- **Windows:** continuous learning v2 depends on bash+python; the observer does not work on native Windows.
- **Security:** an autonomous LLM observer writes "instincts" that self-inject at SessionStart (prompt injection vector); hidden `claude -p` calls in hooks (cost + data without visible consent); `mcp-health-check` makes HTTP requests to MCP servers; MCP configs with unpinned `npx -y` and from sponsors. No remote telemetry was found.
- **Installer** touches the global `~/.claude/settings.json`.
- **The plugin does not allow selecting skills** (all or nothing); `rules/` must be copied by hand.

## Integration decision

| Option | Verdict |
|---|---|
| Full fork | Inherits 103 MB and 15 harnesses; diverges within weeks because of upstream's pace |
| Dependency (install ECC + Shipwright on top) | No version control, routing collisions, ~29k tokens + hooks on every turn |
| Cherry-pick 15–20 pieces | Minimal context, but leaves out useful tools |
| **Full catalog in `vendor/` + on-demand index (chosen in v0.4)** | All development tools available, clean context, no collisions; MIT only requires keeping the notice |

Attribution: `THIRD_PARTY_NOTICES.md` with the MIT license and Affaan Mustafa's copyright + source commit of each piece.

## Components to reuse by phase

| Phase | ECC piece | Quality | Gap we build ourselves |
|---|---|---|---|
| Backbone | `skills/orch-pipeline` (+ `orch-*`): Intake→Research→Plan→Scaffold→TDD→Review→Commit, size classifier, 2 human gates | Best structural piece | Our 8 phases, modes, gates per phase |
| Setup | `commands/project-init.md`, `rules/common`, `rules/<stack>` | Good | Shipwright project structure |
| Intake | `commands/prp-prd.md` (interactive 7-phase PRD with gates), `skills/intent-driven-development` (AC-NNN, scope, assumptions) | Very good / excellent | **EARS**, stable REQ/AC IDs, adaptive interview, glossary, graphify |
| Architect | `agents/architect.md`, `skills/architecture-decision-records`, `skills/contract-first`, `skills/council`, `skills/plan-canvas` | Medium–good | **arc42, MADR, C4**, stack catalog with criteria |
| Plan | `skills/blueprint` (self-contained steps, DAG, parallelism), `agents/planner.md` | Very good | **T001 [P]**, numeric complexity, task→AC link |
| Build | `skills/tdd-workflow` (task→test→RED/GREEN evidence map), `agents/tdd-guide.md`, `skills/dmux-workflows` | Very good | Subagent-per-task + worktree protocol |
| Verify | `workflows/orch-review.workflow.js` (parallel reviewers + adversarial verifier, fails closed), `agents/code-reviewer.md` (>80% confidence filter), `agents/security-reviewer.md`, `agents/e2e-runner.md` | Excellent | **AC→test matrix + gate that fails if an AC has no test** |
| Ship | `skills/deployment-patterns`, `skills/docker-patterns`, `agents/doc-updater.md` | Good (generic) | Runbooks per platform, docs from artifacts |
| Retro | `commands/learn-eval.md` (visible diff + explicit approval), `scripts/lib/skill-evolution/` (snapshot versioning + rollback, provenance, health), instinct format (trigger/action/evidence/confidence) | Very good | **Process** retro → PR to the framework + semver |
| Hooks | `config-protection.js` (exit 2 pattern → protect approved specs), `hookify-runtime.js` (declarative rules in md), `post-edit-accumulator` + `stop-format-typecheck` (lint/tests once on Stop) | Good | One Node dispatcher per event (Windows) |
| Evals | `skills/skill-comply` (measures whether a skill is really followed), `docker/gateguard-effectiveness` (honest A/B with decoys), CI frontmatter validators | Very good | Eval per modified skill before release |
| Stack (catalog) | 21 rule packs + skills per framework (django, fastapi, nextjs, springboot, laravel, flutter, swiftui…) | Raw material | Selection criteria |
| AI / hackathon | `eval-harness`, `agent-harness-construction`, `agent-security-hardening`, `mcp-server-patterns`, `cost-aware-llm-pipeline`, `prompt-caching-strategy`, `rag-pipeline-reviewer`, `ui-demo` | Good | — |

## Avoid
GateGuard by default · observation on every tool use + autonomous observer · hidden `claude -p` in hooks · `mcp-health-check` and sponsors' MCPs · `evaluate-session` v1 (placebo) · `.claude/*`, `contexts/*`, `scaffolds/` (stubs) · `multi-*` (external runtime) · skills from unrelated domains · "Prompt Defense Baseline" block repeated in every agent (centralize).
