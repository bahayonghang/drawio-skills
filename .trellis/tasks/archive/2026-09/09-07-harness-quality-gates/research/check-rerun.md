# Independent check re-run (main session)

Date: 2026-09-07. trellis-check reviewed files but could not spawn Shell; commands re-run here. Product files were not edited.

| Check | Command | Exit | Notes |
| --- | --- | --- | --- |
| workflow-contract | `node --test tests/workflow-contract.test.js` | 0 | 8 pass / 0 fail / 0 skip |
| dry-run ci | `just --dry-run ci` | 0 | output is only `npm run ci` (no version-sync) |
| whitespace | `git diff --check` | 0 | CRLF warnings only |
| lint | `just lint` | 0 | proxies `npm run lint` |

AC3 Node 24 Windows/Linux and GitHub `gh run view`: **UNVERIFIED** (no Node 24 binary, no push). Local Node 26 is not Node 24 evidence.
