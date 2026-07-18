# Implement - 视觉识别导出与返工闭环

## Preconditions

- [ ] User reviewed this `prd.md`, `design.md`, and `implement.md`.
- [ ] Run `trellis-before-dev` for `frontend` and `drawio-skill` specs.
- [ ] Start only `07-18-drawio-vision-rework`; keep parent and C1/C2/C3 buckets in planning.
- [ ] Snapshot existing test-pinned SKILL/reference assertions before wording edits.

## Step 1 - Red Tests for Export Profiles

- Extend `skills/drawio/scripts/runtime/desktop.test.js` first.
- Assert final profile preserves current `-e` and raster scale behavior.
- Assert vision-preview PNG omits `-e` and `-s`, and selects width/height dimension flags explicitly.
- Assert invalid format/profile combinations fail clearly.

Completion: focused tests fail for the new profile behavior while existing final tests remain green.

## Step 2 - PNG Inspection and Repair

- Add `scripts/runtime/png-inspection.js` and colocated tests.
- Add small binary fixtures or programmatically constructed buffers for complete/truncated/rejected states.
- Implement signature, IHDR, chunk boundary and terminal IEND inspection.
- Implement exact known-truncation repair and idempotence.
- Reject arbitrary/non-PNG corruption.

Completion: every PNG state in the design matrix has a deterministic test and passes.

## Step 3 - Output Stabilization

- Add `scripts/runtime/export-stability.js` and tests with injected stat/time/wait behavior.
- Cover immediate stable, delayed appearance, growing file and timeout.
- Integrate after Desktop process return and before reading/repairing output.

Completion: no test uses real sleep, and every export consumer receives only a stable file or an explicit timeout error.

## Step 4 - CLI Vision Preview

- Add `--visual-preview` parsing/help and compatibility validation in `cli.js`.
- Route preview through Desktop with width=2000, inspect, and height re-export when required.
- Keep final export behavior byte/argument compatible for existing tests.
- Add CLI integration tests for flags, artifact placement and error paths.

Completion: small/wide/tall fixtures produce valid preview metadata with longest edge <=2000; Desktop-unavailable path reports the SVG fallback honestly.

## Step 5 - Structured Review and Rework Reference

- Add base `references/workflows/visual-review.md` with the record schema, issue taxonomy, rework mapping and completion criteria.
- Add only concise context pointers to base SKILL/create/edit/replicate.
- Update academic Quality Gate/publication docs to reference the base workflow and retain academic-only checks.
- Do not add duplicate runtime or a second full table to the overlay.
- Update policy tests alongside literal/proximity wording changes.

Completion: one authoritative full workflow exists; all routes point to it; base/overlay ownership tests pass.

## Step 6 - File-Backed Evidence

- Add or select five eval fixtures: small, wide, tall, CJK, dense academic.
- Record deterministic preview assertions.
- Run current-machine Desktop integration when available and capture exact command/version.
- Run visual-model review only when provider/model evidence is available; otherwise record `missing evidence`.
- Generate/update `reports/output_quality_scorecard.md` with execution-kind labels.

Completion: five cases are represented and no recorded fixture is mislabeled as model-executed.

## Step 7 - Validation

Run smallest to broadest:

```powershell
node --test skills/drawio/scripts/runtime/desktop.test.js
node --test skills/drawio/scripts/runtime/png-inspection.test.js
node --test skills/drawio/scripts/runtime/export-stability.test.js
node --test tests/visual-verification-policy.test.js tests/security.test.js tests/integration.test.js
npm test
just ci
npm run docs:build
```

If SKILL descriptions change, additionally run the existing 26-probe trigger regression and description byte/character budget. Do not change descriptions unless route evidence shows a real miss.

## Risky Files and Rollback

- `skills/drawio/scripts/runtime/desktop.js`: preserve existing default args; rollback new profile branch independently.
- `skills/drawio/scripts/cli.js`: keep orchestration thin; rollback the new flag without touching canonical rendering.
- `skills/drawio/SKILL.md` and academic SKILL: literal/proximity tests are sensitive; retain one-line contract wording.
- PNG repair: never write on rejected/unknown corruption; use atomic replacement only after pure-buffer reinspection succeeds.

## Final Review Checklist

- [ ] Existing final export behavior unchanged.
- [ ] Vision preview longest edge <=2000 and has no embedded XML.
- [ ] Stable-file wait covers Windows delayed output.
- [ ] PNG repair is exact, idempotent and rejects unrelated corruption.
- [ ] Review issues bind to stable IDs or honest region-only evidence.
- [ ] YAML-first patches rerun validation and preview.
- [ ] Base owns the workflow; academic only layers policy.
- [ ] Five file-backed cases and evidence labels are complete.
- [ ] Full relevant gates pass or missing evidence is recorded.
