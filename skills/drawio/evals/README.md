# Evals

`evals.json` is the maintained eval set for this skill; its `version` tracks `SKILL.md`. There is no automated runner: each eval is a prompt plus an assertion checklist, verified manually or by an agent, assertion by assertion.

## Scoring method (baseline rounds)

- Execute each prompt through the offline CLI (`scripts/cli.js`) with `--validate --write-sidecars`, writing outputs to a project-root scratch directory (never inside `skills/`).
- Judge every assertion true/false against actual command output, generated files, or — for routing/policy assertions — the literal policy text in `SKILL.md` and its references.
- Assertions that need draw.io Desktop absence, a browser, MCP, or human visual judgment that the environment cannot exercise are marked not-verifiable and excluded from both numerator and denominator.
- Score = 100 x passed / verifiable assertions, one decimal.

## Historical snapshots

- `baseline-prompts.json` — prompt set (id / profile / prompt) from the pre-split eval rounds. Kept for traceability; not consumed by tooling.
- `darwin-results.tsv` — score log. The 2026-07-16 row is the first recorded base-skill baseline (inline dry-run, per-assertion; per-case detail lives in the repo task archive under `.trellis/tasks/*skill-audit-optimization/research/eval-baseline-drawio.md`).

To rerun an eval round, feed the prompts to a fresh session and record pass/fail per assertion in a new dated file; do not overwrite these snapshots.
