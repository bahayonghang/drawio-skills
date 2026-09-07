# Verification evidence — 09-07-harness-test-baseline

Environment (queried, not changed): Node v26.7.0, npm 12.0.2, registry `https://registry.npmjs.org/`, `allow-remote=none`.
Isolated Python: `C:\Users\lyh\AppData\Local\Temp\drawio-parser-venv\Scripts\python.exe` (3.14.7) with `python-hcl2==8.1.2` and `sqlglot==30.12.0`.

| Check | Command | Cwd | Exit | Log |
| --- | --- | --- | --- | --- |
| AC1 npm ci | `npm ci` | `%TEMP%\drawio-ac1-npmci` (manifests only) | 0 | `npm-ci-ac1.log` / `npm-ci-ac1.meta.json` |
| Lock vs HEAD | name/version/integrity compare | repo | 0 | `lockfile-compare.json` (108 resolved-host-only changes; 0 version/integrity changes) |
| AC2 omit-optional ci | `npm ci --omit=optional` | `%TEMP%\drawio-omit-optional` | 0 | `npm-ci-omit-optional.log` |
| AC2 omit-optional test | `npm test` | `%TEMP%\drawio-omit-optional` | 0 | `npm-test-omit-optional.log` (660 pass / 0 fail / 3 skip) |
| Focused tests | `node --test tests/skill-installation.test.js tests/integration.test.js` | omit-optional tree | 0 | `skill-installation-integration.log` (46 pass / 0 skip) |
| AC3 test:parsers | `npm run test:parsers` with `DRAWIO_TEST_PYTHON` | `%TEMP%\drawio-full-parsers` | 0 | `test-parsers.log` (3 pass / 0 skip) |
| Missing Python env | `npm run test:parsers` with `DRAWIO_TEST_PYTHON` unset | repo | 1 | `test-parsers-missing-python.log` (immediate non-zero, no skip) |
| Missing parser packages | `npm run test:parsers` with Python set | omit-optional tree | 1 | `test-parsers-missing-packages.log` (0 skip / 2 fail `OPTIONAL_DEPENDENCY_MISSING`) |
| Isolated Python HCL/SQL | `node --test skills/drawio/scripts/adapters/optional-python.integration.test.js` | full-parsers tree | 0 | `optional-python.log` (1 pass / 0 skip) |
| Version sync | `node scripts/version-sync.js --check` | repo | 0 | `version-sync-check.log` |
| git diff --check | `git diff --check` | repo | 0 | `git-diff-check.log` |
| Node 24 parsers | not run | — | UNVERIFIED | `node24-evidence.md` |
| Desktop / new-session / remote GitHub | not run | — | UNVERIFIED | `unverified.md` |

Notes:
- AC1 lock and package.json SHA-256 were identical before and after `npm ci`.
- Default `npm test` skips the two real-parser files when env is unset (3 skipped tests: two in `code-parsers.integration.test.js`, one in `optional-python.integration.test.js`). Skip is not used as success for parser evidence.
- `just ci` was not run.
- Global npm config was not changed.
