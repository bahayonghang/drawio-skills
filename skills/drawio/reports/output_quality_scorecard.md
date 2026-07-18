# Output Quality Scorecard: Vision Preview C0

Date: 2026-07-18
Decision: **warn**

The C0 preview pipeline passed every deterministic export contract on the current machine. All five PNGs are structurally valid and readable, and no visual issue remains after YAML-first fixture hardening. Provider/model metadata was not captured, so visual inspection is not counted as `model-executed` evidence.

## Governance Boundary

- owner: drawio-skill maintainers
- review cadence: per-release
- input_files: [`../evals/vision-preview-cases.json`](../evals/vision-preview-cases.json) lists five `file-backed fixture` inputs.
- output contract: non-embedded PNG, `profile=vision-preview`, `max(width, height) <= 2000`, valid terminal IEND, work-directory output, and no change to final export defaults.
- rollback boundary: remove the preview profile, evidence manifest, and work-directory review records without changing the existing final 300dpi embedded PNG path.

## Evidence Classification

| Evidence kind | Count | Status | Interpretation |
| --- | ---: | --- | --- |
| recorded fixture | 5 inputs | pass | Five committed YAML inputs are recorded; generated PNGs remain ignored work artifacts. |
| command-executed | 5 cases | pass | The real CLI ran `--validate --visual-preview` for every case. |
| Desktop-executed | 5 cases | pass | draw.io Desktop `30.3.11` produced every inspected PNG. |
| model-executed | 0 cases | missing evidence | The visual inspection did not capture provider/model metadata and is not promoted to model evidence. |
| trust report | 0 | missing evidence | C0 did not regenerate a package-level trust report; governed promotion remains a later release gate. |

## Case Results

| Category | Source | Preview | Dimensions | PNG result | Current visual result |
| --- | --- | --- | ---: | --- | --- |
| small | `cloud-reference-architecture.yaml` | `small.preview.png` | 2000 x 298 | IEND complete; unchanged | pass |
| wide | `arch-dark-microservices.yaml` | `wide.preview.png` | 2000 x 935 | IEND complete; unchanged | pass |
| tall | `vision-tall-workflow.yaml` | `tall.preview.png` | 316 x 2000 | height re-exported; IEND complete; unchanged | pass |
| CJK | `industrial-architecture-cn-paper.yaml` | `cjk.preview.png` | 2000 x 1800 | IEND complete; unchanged | pass after 2 rounds |
| dense academic | `yolo-model-architecture-paper.yaml` | `dense-academic.preview.png` | 2000 x 1153 | IEND complete; unchanged | pass after 2 rounds |

All paths are rooted at `.drawio-tmp/vision-preview/`. The evidence manifest validates source existence, YAML parsing, draw.io XML generation, output paths, review issue fields, and canonical edge targets without requiring Desktop in CI.

## Rework Outcome

- CJK round 1 found `edge:train_api->apscheduler` crossing the scheduler title. Stable waypoints plus `labelOffset` moved the connector and label into clear space. Round 2 has no remaining issue.
- Dense academic round 1 found an empty route artifact on `edge:p3->fuse`; a stable short route removed it.
- The same dense case exposed `edge:spp->p3` crossing Backbone nodes. Stable waypoints routed it through the module gap. Offset candidates either collided in Desktop or represented a different connector despite deterministic acceptance, so the redundant edge label was removed while `meta.legend` retained the dashed-link multi-scale meaning.
- Work-directory records live under `.drawio-tmp/vision-preview/reviews/`. The tracked manifest preserves the initial issues, canonical patch targets, round count, and current status.

## Score Reading

| Measure | Result |
| --- | --- |
| Baseline pass rate | missing evidence; no pre-C0 matched execution set was recorded |
| With-skill deterministic pass rate | 5/5 (100%) |
| Longest-edge and IEND pass rate | 5/5 (100%) |
| Readable with no blocker after rework | 5/5 (100%) |
| Clean with no visual warning | 5/5 (100%) |
| Absolute baseline delta | missing evidence |
| Provider-backed visual-model pass rate | missing evidence |

The deterministic score proves the export and rework contracts, not visual-model quality uplift. A future provider-backed run must record `execution_kind=model`, provider, and model before this report can claim model-executed evidence. A blind A/B comparison against a pre-C0 export set is also `missing evidence`.

## Reproduction

For each source/output pair in the manifest:

```powershell
node skills/drawio/scripts/cli.js <source.yaml> <output.preview.png> --validate --visual-preview
```

Focused evidence check:

```powershell
node --test tests/vision-preview-evidence.test.js
```
