# harness-quality-gates verification

Local machine: Windows, Node v26.7.0, npm 12.0.2, just 1.58.0.
`DRAWIO_TEST_PYTHON=C:\Users\lyh\AppData\Local\Temp\drawio-parser-venv\Scripts\python.exe` for `just ci`.

| Check | Command | Exit | Log |
| --- | --- | --- | --- |
| Workflow contract tests | `node --test tests/workflow-contract.test.js` | 0 | `workflow-contract.log` |
| just ci dry-run | `just --dry-run ci` | 0 | `just-dry-run-ci.log` (prints only `npm run ci`) |
| AC1 temp-copy version drift | `npm run ci` and `just ci` in temp copy | 1 / 1 | `ac1-drift-npm-ci.log`, `ac1-drift-just-ci.log`; hashes unchanged (`ac1-drift-hashes-before.json` / `ac1-drift-hashes-after.json`) |
| just lint | `just lint` | 0 | `just-lint.log` |
| Default tests | `npm test` | 0 | `npm-test.log` (671 / 668 pass / 0 fail / 3 skip) |
| Docs build | `npm run docs:build` | 0 | `docs-build.log` |
| Read-only CI | `just ci` | 0 | `just-ci.log` (`OK: versions are synced at 2.8.0`; default tests 0 fail; `test:parsers` 3 pass / 0 skip; docs build) |
| Tracked hashes | hash before/after `just ci` | unchanged | `tracked-hashes-before.json`, `tracked-hashes-after.json`, `tracked-hash-compare.json` |
| Whitespace | `git diff --check` | 0 | `git-diff-check.log` (CRLF warnings only) |

## UNVERIFIED

- Windows/Linux **Node 24** runtime: UNVERIFIED. See `unverified.md`.
- GitHub Actions `gh run view` on current HEAD: UNVERIFIED (no push).
- Hosted-runner real parser jobs on Node 24: UNVERIFIED.

Local `test:parsers` on Node 26 executed JS/Go/Rust/Python AST and pinned HCL/SQL with zero skips. That is not Node 24 evidence.
