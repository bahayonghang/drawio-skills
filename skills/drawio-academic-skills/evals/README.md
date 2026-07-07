# Evals

`evals.json` is the maintained eval set for this skill; its `version` tracks `SKILL.md`. There is no automated runner: each eval is a prompt plus an assertion checklist, verified manually or by an agent, assertion by assertion.

## Historical snapshots

The other files are frozen artifacts from earlier eval rounds. They are kept for traceability and are not consumed by any tooling:

- `baseline-prompts.json` — prompt set (id / profile / prompt) used for the pre-improvement baseline run.
- `test-prompts.json` — overlay-policy spot-check prompts (id / prompt / expected).
- `darwin-results.tsv` — score log from the skill-creator Darwin improvement round of 2026-04-27 (old/new score, keep/revert status, per-dimension notes).

To rerun an eval round, feed the prompts to a fresh session and record pass/fail per assertion in a new dated file; do not overwrite these snapshots.
