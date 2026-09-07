# Independent check re-run (main session)

Date: 2026-09-07. Reason: trellis-check reviewed the diff but could not spawn Shell; commands were re-run here against current workspace (and the still-present omit-optional temp tree). Product files were not edited.

Environment (queried, not changed): Node v26.7.0, npm 12.0.2, registry `https://registry.npmjs.org/`, `allow-remote=none`. Isolated Python: `%TEMP%\drawio-parser-venv\Scripts\python.exe` (3.14.7).

| Check | Command | Exit | Log |
| --- | --- | --- | --- |
| version-sync | `node scripts/version-sync.js --check` | 0 | stdout: `OK: versions are synced at 2.8.0` |
| whitespace | `git diff --check` | 0 | CRLF warnings only |
| lock hosts | `rg npmmirror package-lock.json` | no matches | current lock |
| focused tests | `node --test tests/skill-installation.test.js tests/integration.test.js` | 0 | `check-rerun-focused.log` (46 pass / 0 fail / 0 skip) |
| default npm test | `npm test` in workspace (DRAWIO_TEST_* unset) | 0 | `check-rerun-npm-test.log` (660 pass / 0 fail / 3 skip) |
| AC2 omit-optional npm test | `npm test` in `%TEMP%\drawio-omit-optional` (no `es-module-lexer`) | 0 | `check-rerun-omit-optional-npm-test.log` (660 pass / 0 fail / 3 skip) |
| AC3 test:parsers | `npm run test:parsers` + `DRAWIO_TEST_PYTHON` | 0 | `check-rerun-test-parsers.log` (3 pass / **0 skip**; CLI XML validation) |
| missing Python | `npm run test:parsers` with env unset | 1 | `check-rerun-missing-python.log` (immediate error, no skip) |
| AC4 Node 24 | not run | UNVERIFIED | `node24-evidence.md` |

`just ci` was not used as a pass gate. Global npm was not changed.
