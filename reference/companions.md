# Optional companions

Shipwright works without these. Installed, they add value in specific phases. Their essentials are already built into Shipwright (`reference/engineering-principles.md`, `vendor/superpowers/`), so nothing depends on them.

| Companion | Install | Adds | Phases |
|---|---|---|---|
| caveman | `/plugin marketplace add JuliusBrussee/caveman` | Terse output in your whole session (saves tokens) | All — Shipwright still writes artifacts in clear prose |
| ponytail | `/plugin marketplace add DietrichGebert/ponytail` | Anti-over-engineering mode and `/ponytail-review`, `/ponytail-audit` | Build, QA |
| andrej-karpathy-skills | `/plugin marketplace add multica-ai/andrej-karpathy-skills` | Coding guidelines as a skill | Build |
| context7 (official marketplace) | `/plugin install context7@claude-plugins-official` | Up-to-date, version-specific library docs: fewer invented APIs | Architect, Build |
| playwright (official marketplace) | `/plugin install playwright@claude-plugins-official` | Browser control for E2E and exploratory testing | QA |
| Trail of Bits skills | `/plugin marketplace add trailofbits/skills` | `spec-to-code-compliance` (code vs spec), `insecure-defaults`, `differential-review`, `supply-chain-risk-auditor`, property-based and mutation testing (CC-BY-SA-4.0: used as a dependency, never copied) | QA, security |
| frontend-design (Anthropic) | `/plugin install frontend-design@claude-plugins-official` | Distinctive, production-grade UI | Build (UI tasks) |
| skill-creator (Anthropic) | `/plugin install skill-creator@claude-plugins-official` | Evals and benchmarks for skills | Retro (framework changes) |

Built into Claude Code and used by Shipwright directly: `/code-review` (QA), `/security-review` (QA, needs an `origin` remote), `/simplify` (end of Build).

Plugin names in the official marketplace can change; if an install command fails, search the marketplace with `/plugin`.
