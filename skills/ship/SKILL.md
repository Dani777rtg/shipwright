---
name: ship
description: Shipwright ship — the second and last approval. Delivers the verified mission as a pull request, a production deploy with canary and rollback, or a document, after the user approves. Use when the user runs /shipwright:ship after a SHIP verdict.
disable-model-invocation: true
---

# Shipwright — SHIP

Principles: `${CLAUDE_PLUGIN_ROOT}/reference/engineering-principles.md`. Messages in the user's language. Scripts from the project root as `node "${CLAUDE_PLUGIN_ROOT}/scripts/<script>.mjs"`.

**Never deploy to production, change DNS, create paid resources, push to a shared remote or open a PR without the user's explicit approval in this session.**

**Preconditions.** `state.mjs get` → `phase` is `ship` and `<docsDir>/verify.md` says SHIP (or residual risks accepted by the user); otherwise stop.

1. **Prepare, in parallel.** Next version from the commits (semver) and its CHANGELOG entry. Production deploy only: `shipwright:security-lead` task **C** (effort `low`), and the exact commands, platform, region, cost and rollback from `<docsDir>/deploy.md` or the existing pipeline.
2. **Gate.** Show: what will be delivered and where; the verify verdict and residual risks; for production, commands, cost and rollback. AskUserQuestion (labels in the user's language) — production: Deploy to production (Recommended) / Wait; PR: Push the branch and open the PR (Recommended) / Wait. Log `metrics.mjs log ship gate-approved|gate-changes "<note>"`.
3. **Deliver.**
   - **Pull request:** push the mission branch, open the PR from `${CLAUDE_PLUGIN_ROOT}/templates/pull-request.md` with a short impact note and how to revert.
   - **Production:** tag `vX.Y.Z`, `shipwright:devops-lead` task **B** (effort `low`) (deploy, smoke, canary ≥ 15 min). On regression it rolls back; then file the bug and return to the fix loop of `/shipwright:verify`.
   - **Document or demo:** deliver it.
4. **Close.** `state.mjs set phase done` and `metrics.mjs log ship end`. Run `/shipwright:feedback` (its one question included). Tell the user what was delivered, where, and that `/shipwright:retro` is optional (it turns lessons into framework improvements).
