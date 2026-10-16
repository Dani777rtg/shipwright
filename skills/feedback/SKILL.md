---
name: feedback
description: Shipwright feedback — at any phase, sends what was slow, over-engineered, broken or missing in this mission to the console that maintains Shipwright, as a local report. Runs on its own when a mission closes. Use when the user runs /shipwright:feedback, or says Shipwright was slow, got in the way or did too much.
argument-hint: "[what to report, optional]"
---

# Shipwright — FEEDBACK

Notes from the user: $ARGUMENTS

Feedback is about **Shipwright**, not the user's product. Report in English (the maintainer reads it), quote the user's words in their language. Two minutes, no subagents.

1. **Evidence**, only what exists: `node "${CLAUDE_PLUGIN_ROOT}/scripts/session-report.mjs"` (top lines: active vs idle time, waits on the user, slowest subagents and tool families), `metrics.mjs summary`, `<docsDir>/verify.md` verdict.
2. **One question** unless the notes already answer it (AskUserQuestion, in the user's language, multiSelect): what got in the way — Too slow / Too much process for the task / A step broke or was wrong / Nothing, it went well — plus "Other".
3. **Write** a report to a temporary file, ≤ 30 lines:
   - `# <one-line verdict>`
   - **Task:** what the mission was, its size (stories, tasks) and whether Shipwright fit it or plain ECC would have been enough.
   - **Slow:** where the time went, with minutes from the evidence.
   - **Over-engineering:** steps, documents, agents or questions that did not change the result.
   - **Broke:** errors and wrong instructions, with the exact text and the Shipwright file involved.
   - **User said:** verbatim.
4. `node "${CLAUDE_PLUGIN_ROOT}/scripts/feedback.mjs" save <file>`: it keeps a local copy and opens an issue in the maintainer's **private** feedback repo (only if gh confirms it is private). Tell the user in one line where it went. Never post it anywhere else: it may hold client details.
