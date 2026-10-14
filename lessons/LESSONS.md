# Lessons learned

One lesson per entry. Added in the RETRO phase after human approval.

Format:

```
## L-NNN — short title
- Symptom: what happened
- Cause: why
- New rule: what changes in the framework
- Origin project: name
- Version: vX.Y.Z where it landed
```

## L-001 — Independent reviews were lost when the session closed
- Symptom: the architecture review ran in the background and its findings disappeared with the session.
- Cause: read-only reviewers returned their findings only to the chat.
- New rule: the reviewer runs in the foreground and its response is saved to `review.md` before approval.
- Origin project: sistema-taller
- Version: v0.13.1

## L-002 — The same rigor for everything made simple work slow
- Symptom: file names and a toggle got the same analysis as credit and backup.
- Cause: the method applied every artifact to every story.
- New rule: high/low risk per story; heavy work only on high risk, checked by `trace.mjs`.
- Origin project: sistema-taller
- Version: v0.14.0 (simplified in v1.0.0)

## L-003 — The method produced documents instead of software
- Symptom: 7 h before building started, 55,700 words of process, 63 tasks for 4 features, 200 planned agent runs.
- Cause: 8 phases with 7 approvals, reviewers per task, tasks of 2–15 min, one document per discipline.
- New rule: 4 phases and 2 approvals; one process document; parallel by default; review per batch; minimal context; pace visible against the deadline.
- Origin project: sistema-taller
- Version: v1.0.0

## L-004 — Builders ran full suites on every task
- Symptom: 182 test runs across 20 tasks; 29 % of builder time.
- Cause: the per-task gate required the full suite, coverage and more; each builder ran it several times.
- New rule: related tests per task, full suite once per batch; test resources isolated per worktree.
- Origin project: sistema-taller
- Version: v1.0.1

## L-005 — Agents without `tools:` paid ~50k baseline tokens on every turn
- Symptom: builders and qa-lead started with 42–50k tokens per turn; ECC reviewers, with 20k.
- Cause: without `tools:` the agent inherits all session tools, including the user's MCPs.
- New rule: each agent declares only the tools it uses; a separate agent only for independence or parallelism.
- Origin project: sistema-taller
- Version: v1.1.1
