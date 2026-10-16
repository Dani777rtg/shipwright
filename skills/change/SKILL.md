---
name: change
description: Shipwright change request — change an approved spec or locked acceptance tests through a recorded delta with impact and the user's approval, then open exactly the affected files, apply it and re-check traceability. Use when the user runs /shipwright:change or a phase reports a needed deviation.
argument-hint: "\"<what changes and why>\""
disable-model-invocation: true
---

# Shipwright — CHANGE

Request: $ARGUMENTS

Messages in the user's language. Scripts from the project root as `node "${CLAUDE_PLUGIN_ROOT}/scripts/<script>.mjs"`.

**Minor change.** A wording fix in a document or a non-behavioural line of a test (a command, a typo, a path), with no effect on any criterion, decision or expected value: skip the impact step and the subagents — write the delta in one line, one AskUserQuestion (Approve / Reject), then step 4 without qa-lead. Anything else, or in doubt: the full flow.

1. **Delta.** If the request is empty, ask for it. Write `<docsDir>/changes/<NNN>-<slug>.md` from `${CLAUDE_PLUGIN_ROOT}/templates/change.md` (NNN = next number): motive; what each part adds, modifies or removes, with IDs.
2. **Impact.** Affected IDs (`trace.mjs`), code already built, tasks to redo, effect on the deadline, new risks. Every locked test that cites an affected ID (grep the acceptance path for them), not only the new ones: `shipwright:qa-lead` (effort `low`) lists those that the change makes wrong or contradictory, and they join the delta. A new trust boundary, dependency or data class → `shipwright:security-lead` task **A** on it.
3. **Gate.** AskUserQuestion (labels in the user's language): Approve (Recommended) / Adjust / Reject. Rejected → mark the delta `rejected` and stop.
4. **Apply.** `change.mjs open <NNN> <file>...` (exactly the listed files); edit them — a new or changed story carries `risk:` and gets the rigor of its level; acceptance-test changes are written by `shipwright:qa-lead` task **A**; `trace.mjs <docsDir>` until OK; `change.mjs close` (re-fingerprints locked tests); mark the delta `applied`; remove tasks to redo from `tasksDone` (`state.mjs set tasksDone '<json array>'`).
5. Tell the user what changed and which phase continues.
