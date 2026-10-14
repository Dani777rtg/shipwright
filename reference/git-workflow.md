# Git workflow — delivered repositories

Applies to missions built from scratch. In an existing system, the team's conventions (branching, commit style, PR rules, CI) win; record them in `existing-system.md` and follow them.

- **Branches:** trunk-based. `main` is always deployable and protected (PR + green CI required). One short-lived branch per task or small group of tasks: `<type>/<task-id>-<slug>` (e.g. `feat/T004-upload-audio`).
- **Commits:** [Conventional Commits 1.0](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `ci:`, `perf:`, `build:`; `!` or `BREAKING CHANGE:` for breaking changes. Footer `serves: <IDs>` (the traceability rule). Small, one logical change each.
- **Pull requests:** template `templates/pull-request.md`; one task (or a coherent set) per PR; checks: tests, lint, types, security scans, `shipwright trace`, locked tests intact. Reviews by the agents of the phase; the user approves merges to `main` when the mission requires it.
- **Versions:** [Semantic Versioning 2.0](https://semver.org/). Tags `vX.Y.Z` created at Ship.
- **Changelog:** [Keep a Changelog](https://keepachangelog.com/), generated from the commits with release-please (or changesets for JS monorepos) and reviewed before the release.
- **Never:** force-push to `main`, commit secrets, skip hooks (`--no-verify`), rewrite published history.

## ECC tools (in `vendor/ecc/`)
`skills/git-workflow`, `commands/pr.md`, `commands/review-pr.md`, `commands/code-review.md`, `agents/pr-test-analyzer.md`.
