# UNVERIFIED (parent R5)

These items are **not pass**. Child runtime on Node 26 / static probes / structure-only CLI does not close them.

| Check | Status | Why |
| --- | --- | --- |
| Node 24 Windows/Linux ABI (JS/Go/Rust/Python AST, Tree-sitter prebuilds) | UNVERIFIED | This machine's active Node is v26.7.0. No Node 24 binary or hosted-runner log in this parent review. Child pins and Node 26 `test:parsers` are not Node 24 evidence. See archived `09-07-harness-test-baseline/research/node24-evidence.md` and `09-07-harness-quality-gates/research/unverified.md`. |
| GitHub Actions on current HEAD | UNVERIFIED | No push of `dev` at HEAD `16b2ac8`. `gh run view` for this HEAD was not obtained. Workflow file pin to Node 24 is not a hosted job result. |
| Five-tool fresh sessions | UNVERIFIED | No new Claude Code / Codex / Grok Build / Kimi Code / OMP session reported actual loaded AGENTS/SKILL absolute paths and versions. `five-tool-probe.md` is CLI `--version`/`--help` plus static paths. |
| Desktop visual | UNVERIFIED | No draw.io Desktop UI or PNG appearance check. Academic CLI `--validate` is spec/XML structure only. |

## Pending, not UNVERIFIED-as-fail

Parent closest local CI / trellis-check (`npm run ci` and related gates) is **pending** the main session after this R5 write-up. Do not record that gate as passed here.
