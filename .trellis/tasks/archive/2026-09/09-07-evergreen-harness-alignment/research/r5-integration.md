# R5 parent integration

Review date: 2026-09-08. Branch `dev`, HEAD `16b2ac8` (ahead of `origin/dev`; no push for this HEAD).
R5 owns parent coordination only. Product source was changed in archived children, not in this review.

## Child map

| Child | Parent AC | Archive path | Work commit | Archive commit | `task.json` |
| --- | --- | --- | --- | --- | --- |
| 09-07-harness-test-baseline | AC1 / R1 | `.trellis/tasks/archive/2026-09/09-07-harness-test-baseline/` | `4e33fe3` 2026-09-07 20:45 +0800 | `50d71d6` 2026-09-07 20:46 +0800 | `completed` 2026-09-07 |
| 09-07-harness-quality-gates | AC2 / R2 | `.trellis/tasks/archive/2026-09/09-07-harness-quality-gates/` | `a99aa01` 2026-09-07 21:13 +0800 | `ff77b56` 2026-09-07 21:13 +0800 | `completed` 2026-09-07 |
| 09-07-harness-rule-alignment | AC3 / R3 | `.trellis/tasks/archive/2026-09/09-07-harness-rule-alignment/` | `5ad59cc` + `f0fbd61` 2026-09-08 08:50 +0800 | `aea4707` 2026-09-08 08:50 +0800 | `completed` 2026-09-08 |
| 09-07-harness-skill-doc-evidence | AC4 / R4 | `.trellis/tasks/archive/2026-09/09-07-harness-skill-doc-evidence/` | `882a219` 2026-09-08 09:08 +0800 | `16b2ac8` 2026-09-08 09:08 +0800 | `completed` 2026-09-08 |

Each child has `prd.md`, `design.md`, `implement.md`, `implement.jsonl`, `check.jsonl`. JSONL entries are concrete repo paths (planning-seeded spec/research files), not `{{placeholder}}` templates.

## Sequential start after approval

Git order is one child at a time: work commit, then that child's archive, then the next child's work.

1. test-baseline `4e33fe3` → archive `50d71d6`
2. quality-gates `a99aa01` → archive `ff77b56`
3. rule-alignment `5ad59cc` → evidence `f0fbd61` → archive `aea4707`
4. skill-doc-evidence `882a219` → archive `16b2ac8`

Parent remains at `.trellis/tasks/09-07-evergreen-harness-alignment/` with `status=in_progress`. There is no parent archive commit. All four child archives happened while the parent was still active.

## Parent AC vs child evidence

| Parent AC | Child AC checkboxes | Runtime evidence | Remains UNVERIFIED |
| --- | --- | --- | --- |
| AC1 | Child AC1–AC3 `[x]`; child AC4 `[ ]` Node 24 | Isolated `npm ci` exit 0; omit-optional `npm test` 660 pass / 0 fail / 3 skip; `test:parsers` 3 pass / 0 skip; missing Python/packages exit 1 with 0 skip; isolated HCL/SQL Python exit 0. Logs under child `research/` and `verification-summary.md`. Local Node **v26.7.0** / npm 12.0.2. | Node 24 JS/Go/Rust/Python AST (`node24-evidence.md`) |
| AC2 | Child AC1/AC2/AC4 `[x]`; child AC3 `[ ]` Node 24 | Temp-copy version drift: `npm run ci` / `just ci` exit 1, hashes unchanged (`ac1-drift.meta.json`). Consistent workspace `just ci` exit 0, `tracked-hash-compare.json` `changed=[]`. `workflow-contract.test.js` exit 0. Workflow pin Node 24 is a file contract, not a hosted run. | Node 24 Windows/Linux ABI; GitHub Actions on current HEAD (no push) |
| AC3 | Child AC1–AC4 `[x]` | Shared `AGENTS.md` + thin `CLAUDE.md` (`shared-rules-check.json`). Local `.agents/skills/drawio*` refreshed to 2.8.0 (`install-refresh.md`; gitignored). `skill-installation` / `skill-metadata` 8 pass. Five CLI `--version`/`--help` and `TRELLIS_PLATFORM` five-value probe (`five-tool-probe.md`, `trellis-platform-probe.md`). | Fresh five-tool sessions (actual loaded AGENTS/SKILL paths) |
| AC4 | Child AC1–AC5 `[x]` | Policy/install/metadata tests 21 pass; academic CLI `--validate` structure pass; `just lint`; `docs:build`; `version-sync --check`; `npm test` 676/673 pass / 0 fail / 3 skip. Matrix in skill `harness-compatibility.md`; academic points at `../drawio`. | Desktop visual / PNG appearance |
| AC5 | Parent coordination | This file; child archives and commits above; parent still unarchived. JSONL exist on parent and all four children. | Parent read-only release gate (`npm run ci` / trellis-check) is **pending** in the main session — not recorded as pass |

## What is not claimed

- Local Node 26 success is not Node 24 ABI or Tree-sitter evidence.
- Static CLI `--help` / path probes are not fresh-session load proofs.
- CLI `--validate` is structure only, not Desktop visual QA.
- No `gh run view` on HEAD `16b2ac8` (branch not pushed).
- R5 does not mark the parent release gate as passed.
