# harness-skill-doc-evidence verification

Environment: Windows PowerShell; Node v26.7.0. Structure/docs/policy only. No Desktop UI, no paid five-tool sessions, no GitHub push.

| Check | Command | Exit | Log |
| --- | --- | --- | --- |
| Policy / install / metadata | `node --test tests/visual-verification-policy.test.js tests/drawio-academic-skill.test.js tests/palette-skill-policy.test.js tests/skill-installation.test.js tests/skill-metadata.test.js` | 0 | `policy-tests.log` (21 pass) |
| Academic CLI structure | `node skills/drawio/scripts/cli.js …/system-architecture-paper.yaml <temp>.svg --validate --write-sidecars --sidecar-dir <temp>` | 0 | `cli-academic-example.log` (spec+XML PASSED; `.drawio`+`.svg` beside output; sidecars in work dir) |
| Markdown lint | `just lint` | 0 | `just-lint.log` |
| Docs build | `npm run docs:build` | 0 | `docs-build.log` |
| Version check | `node scripts/version-sync.js --check` | 0 | `version-sync-check.log` (`OK: versions are synced at 2.8.0`) |
| Default tests | `npm test` | 0 | `npm-test.log` (676 / 673 pass / 0 fail / 3 skip) |
| Whitespace | `git diff --check` | 0 | `git-diff-check.log` (CRLF warnings only) |

Skill-only copy can read `references/docs/harness-compatibility.md`. Academic overlay does not contain that file and points at `../drawio/references/docs/harness-compatibility.md`.
