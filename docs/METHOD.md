# The Shipwright method

How Shipwright takes a problem to working software, fast and without lowering quality. Version **v1.2.0**.

## The goal in one line

**A problem comes in → we ask ECC's experts how to solve it (architecture, development, QA) → we build it in parallel → brief checks → it ships.**

ECC holds the expertise: its skills and rules say how to build well for each stack, its reviewers know what to look for. Shipwright adds only what ECC does not: one approved spec, parallel builders, acceptance tests nobody can bend, and two human approvals. ECC's guidance raises the quality of the code, but it does not prove it: the locked acceptance tests do.

## 1. Principles

1. **Speed first, over a fixed quality floor.** Not negotiable: acceptance tests written from the criteria by an independent agent and locked; tests first; suite, types and lint green before integrating; a security check of sensitive diffs; human approval of the spec and of production. Everything else is judged by whether it speeds delivery up.
2. **Experts as knowledge, agents for independence or parallelism.** ECC's skills and rules go to whoever is working; a separate agent exists only for independent judgment (QA, security, review) or to run work at the same time.
3. **Act, don't deliberate.** The thinking happens once, when the experts are consulted for the spec. After that, agents run at low effort with short reports.
4. **Infer, don't ask.** Read the brief, the repository and its docs; ask only what blocks, in one batch.
5. **One process document.** `spec.md` holds objectives, stories, criteria, expert input, decisions, minimal design, threats, tests and tasks; `verify.md` closes with the verdict. The delivered product is well documented: a README whose quick start works, configuration, API.
6. **Rigor by risk** (§3): heavy checks only where there is money, personal data, permissions, integrations or irreversible operations.
7. **Two human approvals:** the spec (with the plan) and the delivery.
8. **What cannot be negotiated is deterministic:** hooks and scripts, not pleas in a prompt.

## 2. Phases

| # | Phase | Command | What happens | Human |
|---|---|---|---|---|
| 1 | **Spec** | `/shipwright:spec "<brief>"` | Reads the brief and the system; one batch of questions; consults ECC's experts (architect, stack skills, TDD and e2e, planner); writes `spec.md`; brief review; **approval**; stack packs installed; one qa-lead per story writes the acceptance tests in parallel; they are locked | **Approves spec and plan** |
| 2 | **Build** | `/shipwright:build` | Batches of ready tasks, each in its worktree with a builder that reads the stack skills for its files; related tests and type check per task; build errors go to the language's build resolver; one ECC reviewer per batch; pace against the deadline; final docs pass with a proven quick start | — |
| 3 | **Verify** | `/shipwright:verify` | Fingerprints, hidden tests, full suite, pertinent test types, brief security pass; parallel fixes; **SHIP / NO SHIP** | Only on NO SHIP |
| 4 | **Ship** | `/shipwright:ship` | PR, production deploy with canary and rollback, or a document | **Approves delivery** |
| — | Change | `/shipwright:change` | Delta with impact and approval on the spec or locked tests | Approves |
| — | Status | `/shipwright:status` | Phase, pace, estimated finish against the deadline, risks | — |
| — | Feedback | `/shipwright:feedback` | Any time and at the end of ship: a short report of what was slow, over-engineered or broken, saved to the local inbox `~/.claude/shipwright/feedback/` that the Shipwright repo console lists on startup | Answers one question |
| — | Retro | `/shipwright:retro` | Optional: lessons → tested framework changes | Approves |

Phases chain on their own: approving the spec starts Build, Build hands over to Verify, and SHIP leads to the delivery approval. Commands are for resuming.

**From scratch or existing.** From scratch: the spec picks the stack ([`stack-catalog`](stack-catalog.md)) and the first task is a skeleton that runs and deploys. Existing: first the user confirms the code may be sent to Claude; the spec records the current system in one section and follows its conventions.

## 3. Traceability, risk and budget

Chain: **O** objective (with a measure) → **US** story → **AC** EARS criterion → **T** task → test. High-risk stories add **TM** threats (they serve their story; mitigating tasks serve the threat).

- Every item carries `serves: <IDs>`. `scripts/trace.mjs` checks orphans, invalid IDs and kinds, coverage (every O with a story, every story with a criterion, every criterion and threat with a task) and, in Verify, that every criterion has a test citing it and every threat has evidence.
- **Risk.** Every story carries `risk: high — <reason>` or `risk: low — <reason>` (Spanish `riesgo: alto|bajo` is accepted too). High when it touches money (charges, invoicing, cash, credit), personal or sensitive data, authentication, permissions or isolation between customers or branches, an external integration, or bulk or irreversible data operations. When in doubt, high.
  - Every story: EARS criteria, acceptance tests, tests first, batch review, baseline security controls.
  - High risk only: threats, heavy test types (load, DAST, full authorization matrix, exploratory, recovery), an adversarial pass. `trace.mjs` rejects threats on low-risk stories.
- **Budget** (checked by `trace.mjs`): ≤ 12 stories per mission, ≤ 6 criteria and ≤ 3 tasks per story, ≤ 4 threats per high-risk story. Exceeding it needs a line `Budget exceeded: <KIND> — <reason>`, shown at the approval.

## 4. Agents

| Agent | Model · effort | When |
|---|---|---|
| `spec-reviewer` | Opus · medium | Brief review of the spec before approval (read-only, blockers and majors only) |
| `qa-lead` | Sonnet · low | Acceptance tests per story; verification and verdict |
| `security-lead` | Sonnet · low | Short checks of sensitive diffs and new dependencies; scans and threat evidence; production hardening |
| `builder` | Sonnet · low | One task, tests first, minimal context, the stack skills for its files |
| `docs-lead` | Sonnet · low | Final product docs pass and proven quick start |
| `devops-lead` | Sonnet · low | Only when deploying: staging and production |
| ECC reviewer | Sonnet · low | One per batch: the installed language reviewer, or code-reviewer |

Every agent declares only the tools it uses. How ECC is used by role: [`using-ecc`](../reference/using-ecc.md); the measured study behind it: [`research/ecc-usage`](research/ecc-usage.md).

## 5. Mission layout

```
.shipwright/state.json   phase, deadline, paths, locked tests, finished tasks
<docsDir>/
  spec.md                the only process document (approved = protected)
  review.md              spec-reviewer findings and what was done with each
  verify.md              verdict and evidence
  deploy.md              only when production infrastructure is created or changed
  changes/               approved deltas
  client/                the client's original material
  metrics.md             generated
tests/acceptance/        locked (hook + SHA-256 fingerprints); ~1 in 5 hidden until Verify
```

`<docsDir>` is `docs/` from scratch and `docs/shipwright/<mission>/` in an existing system. Artifacts are written in the user's language.

## 6. Deterministic guards

- `PreToolUse` hook: blocks edits to `.shipwright/`, locked tests and approved artifacts, except files opened by an approved change.
- `lock.mjs`: fingerprints of locked tests and import of the hidden ones.
- `trace.mjs`: traceability, risk and budget.
- Metrics hooks (phase start, ECC tools used) and a context hook (mission, phase, deadline and next command after `/clear` or `/compact`).
- **No production deploy, DNS change, paid resource, push or PR without the user's explicit approval.**

## 7. Measuring and improving

`benchmarks/` holds 4 fixed missions; `scripts/bench.mjs` scores a finished mission and compares versions — slower, more approval rounds, trace problems, budget overruns or more process words make a version worse. `scripts/session-report.mjs` reads the Claude Code transcripts and measures where time and tokens really went. `scripts/feedback.mjs` collects the feedback reports from every mission console. The optional retro turns lessons into changes tested against the benchmark.

## Roadmap

| Version | Content |
|---|---|
| v0.5–v0.16 | 8-phase method (tag `v0.16.0`) |
| v1.0–v1.1 | 4 phases, 2 approvals, parallel by default, one process document, ECC by role, token study |
| **v1.2** | One goal (problem → ECC experts → build → brief checks), low-effort agents, English documentation *(current)* |
| v1.x | Measured with the benchmark and real missions |
| v2.0 | Autonomous orchestrator with the Claude Agent SDK |
