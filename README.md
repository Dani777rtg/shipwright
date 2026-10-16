# Shipwright

A Claude Code plugin that takes a problem to working software **fast and done right**: ECC's experts say how to build it, agents build it in parallel with tests first, brief checks, and you approve the spec and the delivery.

**Status:** v1.2 — 4 phases, 2 approvals. The 8-phase version remains available at tag `v0.16.0`.

## When to use it

| Use Shipwright | Use ECC directly (just ask Claude) |
|---|---|
| A product or feature with several user stories (roughly 2–12) | A bug fix, a few-line change, a rename, copy or style edits |
| Work with a deadline or a client who must approve what gets built | A throwaway prototype, a spike, an experiment |
| Code that must be proven to work: money, auth, personal data, production deploys | Questions about code, refactors with no behaviour change |
| Several pieces that can be built in parallel | One small story with no real risk |

Rule of thumb: if you could describe the whole change in one sentence and review it in one sitting, Shipwright is overkill. `/shipwright:spec` checks this first and offers to do small tasks directly.

## How it works

**Problem → ask ECC's experts (architecture, development, QA) → build in parallel → brief checks → ship.**

| Phase | What happens | You |
|---|---|---|
| 1. Spec | Reads the brief and your code, asks only what blocks, consults ECC's experts, writes one spec with stories, verifiable criteria, risk and tasks | **Approve** |
| 2. Build | One QA agent per story writes the locked acceptance tests; builders work in parallel with your stack's ECC skills, tests first; one review per batch; pace against your deadline; product docs with a proven quick start | — |
| 3. Verify | Hidden tests, full suite, pertinent test types, a short security pass → SHIP / NO SHIP | Only if something fails |
| 4. Ship | PR, deploy with canary and rollback, or a document | **Approve** |

Phases chain on their own. `/shipwright:status` shows progress and whether the deadline holds; `/shipwright:change` changes what was approved, with impact and approval; `/shipwright:feedback` (any time, and automatically at the end of ship) leaves a short report — what was slow, over-engineered or broken — in `~/.claude/shipwright/feedback/`, a local inbox the console working on this repo shows on startup; `/shipwright:retro` (optional) improves the framework with what was learned.

Not traded for speed: acceptance tests written by an independent agent that builders cannot touch, tests first, everything green before integrating, a security check of sensitive code, your approval of the spec and of production. ECC's skills make the code better; the locked tests prove it works.

## Install

Two **separate** commands: type the first, press Enter and wait; then the second.

1. Add the marketplace:
   ```
   /plugin marketplace add Dani777rtg/shipwright
   ```
   (If an "Enter marketplace source" box opens, type only `Dani777rtg/shipwright` there.)
2. Install the plugin:
   ```
   /plugin install shipwright@shipwright
   ```

Check by typing `/shipwright`: `/shipwright:spec`, `/shipwright:build`… should appear. If not, run `/reload-plugins`.

Requirements: git and Node 18+. Optional: graphify (`pip install graphifyy`) to map existing systems.

## Use

```
/shipwright:spec "AI app that summarizes meetings, 24 h hackathon"
```

If the brief comes as documents (PDF, notes, transcripts), pass their path: `/shipwright:spec "C:\folder\brief.md"`. It works the same for something **new** and for a change to an **existing system** ("add Google login to our app"). Shipwright talks to you and writes the mission documents in your language.

## Documentation

- [Method](docs/METHOD.md) — goal, phases, risk, budget, agents
- [ECC by role](reference/using-ecc.md) · [Test catalog](reference/qa-catalog.md) · [Stack catalog](docs/stack-catalog.md)
- [Research](docs/research/) — the sources and measurements behind each decision
- [Changelog](CHANGELOG.md)

Built on [ECC](https://github.com/affaan-m/ecc) (MIT) and [graphify](https://github.com/Graphify-Labs/graphify). MIT license.
