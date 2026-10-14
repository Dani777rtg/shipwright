---
name: verify
description: Shipwright verify — independent verification of the built mission (locked and hidden acceptance tests, full suite, pertinent test types, security, code review, docs) with a fix loop and a SHIP / NO SHIP verdict; on SHIP continues to the ship gate. Use when the user runs /shipwright:verify.
disable-model-invocation: true
---

# Shipwright — VERIFY

Principles: `${CLAUDE_PLUGIN_ROOT}/reference/engineering-principles.md`. Messages in the user's language. Scripts from the project root as `node "${CLAUDE_PLUGIN_ROOT}/scripts/<script>.mjs"`. The agents that verify are not the ones that built.

**Preconditions.** `state.mjs get` → `phase` is `verify` and every task of the spec is in `tasksDone`; otherwise say what is missing and stop.

1. **Integrity.** `lock.mjs verify`; any change → S1 bug, show the user what changed and stop. Then `lock.mjs holdout <acceptance path>/holdout`.
2. **Staging** — only when `deployTarget` is a platform: `shipwright:devops-lead` task **A**, in parallel with step 3 (step 3 starts on the local build and re-runs the smoke against staging when it is up). It asks before creating paid resources.
3. **Verification, in parallel:**
   - `shipwright:qa-lead` task **C** → `<docsDir>/verify.md`.
   - `shipwright:security-lead` task **B**.
   - Built-in `/code-review high` on the mission diff and, with an `origin` remote, `/security-review`.
   - `${CLAUDE_PLUGIN_ROOT}/vendor/ecc/agents/silent-failure-hunter.md` on the mission diff (per `${CLAUDE_PLUGIN_ROOT}/reference/using-ecc.md`).
4. **Fix loop.** Each S1/S2 bug or high/critical finding: a `shipwright:builder` with the finding, `${CLAUDE_PLUGIN_ROOT}/vendor/superpowers/systematic-debugging/SKILL.md` (root cause first) and a regression test outside the locked paths; independent fixes in parallel; re-run only the affected checks. A fix that needs a spec or acceptance-test change → `/shipwright:change`. S3/S4: fix if cheap, else list in verify.md.
5. **Close.** `trace.mjs <docsDir> --phase verify --tests <test dirs>` OK; verify.md complete with the verdict. Log `metrics.mjs log verify end "<SHIP|NO SHIP>"`.
   - **SHIP** → `state.mjs set phase ship`, then read `${CLAUDE_PLUGIN_ROOT}/skills/ship/SKILL.md` and follow it (its gate asks the user).
   - **NO SHIP** → show what blocks and ask: Corregir (Recomendado) / Aceptar riesgos y continuar (record who and why in verify.md).
