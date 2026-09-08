# Parent release gate (conjunction)

Date: 2026-09-07. HEAD before this evidence file: `21bd6c2`. Environment (queried, not changed): Node v26.7.0, npm 12.0.2, `DRAWIO_TEST_PYTHON` = `%TEMP%\drawio-parser-venv\Scripts\python.exe`. `DRAWIO_TEST_CODE_PARSERS` unset except inside `npm run test:parsers`.

`just --dry-run ci` printed only `npm run ci` (exit 0). `just ci` is the read-only gate (`version:check && lint && test && test:parsers && docs:build`). It does not run mutating `version-sync`.

| Check | Exit | Evidence |
| --- | --- | --- |
| `just --dry-run ci` | 0 | stdout: `npm run ci` |
| `node scripts/version-sync.js --check` | 0 | `OK: versions are synced at 2.8.0` |
| `just ci` / `npm run ci` | 0 | `release-gate-just-ci.log` |
| inner `npm test` | 0 | 674 pass / 0 fail / 2 skip |
| inner `npm run test:parsers` | 0 | 3 pass / **0 skip**; CLI XML validation |
| inner `just lint` / `npm run lint` | 0 | markdownlint in the same log |
| inner `npm run docs:build` | 0 | VitePress build complete 4.78s |
| `git diff --check` (before and after `just ci`) | 0 | |
| tracked files mutated by `just ci` | none | only new untracked logs under this task `research/` |

## AC1–AC4 child evidence (already in parent prd)

Archived under `.trellis/tasks/archive/2026-09/` for test-baseline, quality-gates, rule-alignment, skill-doc-evidence.

## UNVERIFIED (not pass)

- Node 24 Windows/Linux ABI
- GitHub Actions on current HEAD (no push)
- Five-tool fresh sessions
- Desktop visual / PNG appearance

`just ci` was the post-quality-gates read-only gate, not the old mutating recipe.
