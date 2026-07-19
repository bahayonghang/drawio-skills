# Implementation Plan - Raster 与 replicate canonical adapter

## Dependencies and Scope Gate

- [x] Confirm C0 vision rework is archived and existing replicate/JS ELK/canonical renderer tests are green.
- [x] Confirm only this child is executable; parent and dir2 bucket remain planning.
- [x] Recheck `git status --short --untracked-files=all`; protect `archive/.gitignore`, preview, `.drawio-tmp/` and unrelated work.
- [x] Load `.trellis/spec/drawio-skill/index.md`, canonical adapter contract, current replicate workflow and DSL schema before editing.
- [x] Do not modify the two `SKILL.md`, interfaces, global eval/scorecard, compatibility, docs/release files, package manifests, lockfiles or academic runtime.

## Red - Focused Regression Tests

- [x] Add adapter tests for explicit-bounds preservation, shape/type/style/edge mapping, all-or-none ELK fallback and deterministic output.
- [x] Add bad cases for malformed/unsupported version, unknown keys, partial/non-finite geometry, unsafe/duplicate IDs, dangling edges, invalid colors, prototype keys, limits, raw style/HTML/image/link payloads and opaque text styles.
- [x] Add file-backed fixture test proving adapter -> `validateSpec` -> existing JS ELK when needed -> `specToDrawioXml` -> `validateXml`.
- [x] Add CLI integration tests for file/stdin, `--export-spec`, render and sidecars.
- [x] Run tests before implementation and record the expected missing-export/unsupported-format failures.

## Green - Minimal Implementation

- [x] Implement `parseRasterExtraction` using shared JSON/safety/error helpers; rebuild allowlisted canonical objects without raw passthrough.
- [x] Export it from `scripts/adapters/index.js`.
- [x] Add `raster-extraction` to CLI help and the existing parser routing branch; reuse all downstream validation/layout/artifact code unchanged.
- [x] Add only the fixture needed by focused tests.
- [x] Keep the whole implementation ESM/Node 20, deterministic and dependency-free.

## Verify and Review

- [x] Focused: `node --test skills/drawio/scripts/adapters/raster-extraction.test.js`.
- [x] Focused integration: `node --test --test-name-pattern="raster extraction" tests/integration.test.js`.
- [x] Related DSL/adapter tests: `node --test skills/drawio/scripts/adapters/raster-extraction.test.js skills/drawio/scripts/adapters/index.test.js skills/drawio/scripts/dsl/spec-to-drawio.test.js`.
- [x] Run `trellis-check` against PRD/design/implementation and inspect cross-layer data flow.
- [x] Run `npm test`, `just ci`, and `git diff --check`.
- [x] Inspect full diff and `git status`; confirm no protected/unrelated artifacts, dependency changes, duplicate renderer, academic runtime or integration files.
- [x] Record Desktop/model/human fidelity as `missing evidence`, not pass.

## Finish and Rollback

- [x] Add `.trellis/spec/drawio-skill/raster-replicate-adapter.md` and link it from the spec index only after behavior is verified.
- [x] Update this checklist and task evidence with exact command results; validate task context.
- [x] Stage only the explicit child allowlist, inspect `git diff --cached --name-status`, and create Chinese Conventional Commit(s) with emoji, `[AI]`, Why and agent trailer.
- [ ] Archive this child only, then add one session journal entry and commit Trellis lifecycle changes separately.
- [x] Rollback point: remove the new adapter/export/CLI branch/tests/spec. No migration or generated catalog rollback is required.

## Verification Evidence

- Red evidence: missing module; unsupported `raster-extraction` CLI route; missing fixture; control-character/raw-HTML/oversize-geometry gaps all failed before their implementation slices.
- Focused adapter: 6 tests passed, 0 failed.
- Focused CLI: 2 tests passed, 0 failed; file/stdin, canonical YAML, `.drawio`, arch/spec sidecars and XML validation executed.
- Related adapter/DSL: 220 tests passed, 0 failed.
- `npm test`: 626 total, 624 passed, 2 optional parser skips, 0 failed.
- `just ci`: version sync, Markdown lint, the same 626-test suite and VitePress docs build passed.
- `git diff --check`: passed; line-ending notices are repository checkout warnings, not whitespace errors.
- Evidence classification: parser/layout/renderer/CLI are `command-executed`; checked-in JSON is `file-backed`; raster interpretation, OCR/model accuracy, Desktop export and human source comparison remain `missing evidence`.
- Work commit: `0b6a379 feat(adapter): [AI] ✨ 添加 raster canonical extraction adapter`.
