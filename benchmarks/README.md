# Reference mission bench

Four fixed missions to measure whether a new Shipwright version gets better or worse (`docs/METHOD.md` §7). The mission briefs are in Spanish on purpose, to exercise the user-language rule.

| Mission | Starting point | What it exercises |
|---|---|---|
| [01-ai-meeting-summarizer](01-ai-meeting-summarizer/) | From scratch | AI app: evals, cost/latency, interface, deployment |
| [02-booking-api](02-booking-api/) | From scratch | API with data, authentication, roles, load, security |
| [03-existing-todo-api](03-existing-todo-api/) | On existing code | Change in a repo with tests, conventions, PR |
| [04-existing-todo-filter](04-existing-todo-filter/) | On existing code | Small change: one low-risk story, no threats, ≤ 3 tasks, few process words. Watches for over-engineering in the framework itself |

## How to run

1. Copy the mission folder to a temporary directory (for 03 and 04, copy `03-existing-todo-api/repo/` and work inside it).
2. Run the phases with the Shipwright version you want to measure, answering the interview **only** with `answers.md`. Anything `answers.md` does not cover is answered "I don't know" (this also measures the research).
3. When `ship` finishes: `node <shipwright>/scripts/bench.mjs score <folder> --out results/<version>-<mission>.json`.
4. Compare against the previous version: `node <shipwright>/scripts/bench.mjs compare results/<before>.json results/<after>.json` (exits with code 1 if anything gets worse: more hours, more gate rounds, more traceability problems, budget exceeded, more process words, missing `spec.md` or `verify.md`, or a different verdict).

Execution is manual today because the phases are interactive. v2.0 (an orchestrator built on the Claude Agent SDK) will automate it.
