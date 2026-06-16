# PRD: 收口 drawio 最终产物并修复重复边标签

## Goal

Make the two drawio skills produce clean user-facing diagram directories: intermediate generation files stay in a project-local temporary workspace, while final output directories contain only the editable `.drawio` file and the visual verification `.svg` file by default.

Also fix the observed duplicate text rendering around connector labels, where labels such as `分/小时融合`, `低频先验`, `统一口径`, and `对齐样本` appear twice or overlap in the final view.

## User Value

- Thesis and project figure directories stay clean and reviewable.
- Users can trust that final deliverables are the files they need to keep: `.drawio` and `.svg`.
- Intermediate YAML/spec/arch files remain available for debugging and reproducible generation without polluting the final target directory.
- Generated diagrams do not show duplicate connector text caused by invalid or redundant draw.io XML label representation.

## Confirmed Facts

- The current generated thesis directory `D:\Documents\LYH\200-Learning\00博士毕业\毕业论文\thesis\drawio\chapter2` contains five generated artifacts for one figure:
  - `ch2_overall_framework_academic.drawio`
  - `ch2_overall_framework_academic.svg`
  - `ch2_overall_framework_academic.spec.yaml`
  - `ch2_overall_framework_academic.arch.json`
  - `ch2_overall_framework_academic.yaml`
- The current base skill says the canonical editable trio is `<name>.drawio`, `<name>.spec.yaml`, and `<name>.arch.json`, and the example commands default to `--write-sidecars`.
- The current academic overlay treats `.drawio`, `.spec.yaml`, `.arch.json`, and `.svg` as the default academic delivery bundle and completion gate.
- `skills/drawio/scripts/cli.js` implements `--write-sidecars` by writing `.spec.yaml` and `.arch.json` next to the requested output.
- `deriveArtifactPaths(outputFile)` currently derives sidecar paths from the final output path, so sidecars naturally land beside final `.drawio` or `.svg`.
- The generated `.drawio` file contains duplicate label definitions for labeled connectors:
  - the edge cell itself has `value="分/小时融合"`;
  - a child `mxCell` with `style="edgeLabel"` also has `value="分/小时融合"`;
  - the same pattern appears for other connector labels.
- `skills/drawio/scripts/dsl/spec-to-drawio.js` currently writes `value="${edgeLabel}"` on the edge cell and then emits an `edgeLabel` child cell with the same value when `rawEdgeLabel` exists.
- The repository SVG renderer already contains logic to avoid rendering parent edge labels when `edgeLabel` child cells exist, but draw.io Desktop or other renderers may still display both because the XML itself stores the label twice.
- A thesis-local `.agents/skills/drawio` copy exists under `D:\Documents\LYH\200-Learning\00博士毕业\毕业论文\thesis\.agents\skills\drawio`, including a modified `scripts/svg/drawio-to-svg.js` and a local `scripts/node_modules/js-yaml`.
- The statement in the prior run says the local `.agents/skills/drawio/scripts/svg/drawio-to-svg.js` was modified to handle group coordinates and multiline Chinese, and `js-yaml` was added locally. `.agents/` is ignored and is not thesis deliverable content.
- In this repo, `.agents/` is ignored by `.gitignore`, so ad-hoc fixes inside `.agents/skills/drawio` will not become durable fixes unless ported back into the repo skill source.

## Requirements

1. Default final delivery directories must contain only:
   - `<name>.drawio`
   - `<name>.svg`
2. Intermediate generation artifacts must be written to a current-project temporary directory by default, not next to final deliverables:
   - raw authoring YAML
   - canonical `.spec.yaml`
   - `.arch.json`
   - scratch scripts or diagnostic outputs
3. The temporary directory must be inside the user's current project by default so files remain inspectable and recoverable, but it must be clearly separated from final figure directories.
4. The skills must report intermediate artifact paths separately from final deliverables.
5. Sidecars must remain supported when explicitly requested for reproducible editing, debugging, import/export workflows, or tests.
6. Agents using the skill must not create or modify ad-hoc JS scripts inside user project `.agents/skills/drawio` as a normal diagram-generation step.
7. Any necessary renderer or CLI fix learned from a user-project `.agents` copy must be ported into the repository source and tested there.
8. Generated draw.io XML must not define the same connector label both on the edge cell and on an `edgeLabel` child cell.
9. The SVG verifier must continue to support offset edge labels, multiline Chinese text, and grouped coordinate systems.
10. Documentation, skill instructions, evals, and tests must agree on the new default: final deliverables are `.drawio` and `.svg`; sidecars are intermediate or explicit debug/reproducibility outputs.

## Acceptance Criteria

- Running the default create flow can produce final `<name>.drawio` and `<name>.svg` in the requested output directory without leaving `.yaml`, `.spec.yaml`, or `.arch.json` there.
- The same run writes intermediate files under a project-local temp directory and reports that path.
- A CLI or documented option still allows keeping sidecars beside output when explicitly requested.
- A regression test proves labeled edges with `labelOffset` do not duplicate label text in the generated `.drawio` XML.
- A regression test proves generated SVG includes each connector label once for a representative offset-label diagram.
- Existing import/edit workflows that rely on sidecars remain available through explicit flags or documented commands.
- Skill docs for both `skills/drawio` and `skills/drawio-academic-skills` no longer describe `.spec.yaml` and `.arch.json` as default final deliverables.
- Evals and tests no longer assert sidecars as default final deliverables, except in cases that explicitly request a reproducible bundle or sidecars.
- `npm test` or the narrow Node test set covering drawio DSL/SVG/skill policy passes.

## Out of Scope

- Cleaning or deleting the user's thesis artifacts in `D:\Documents\LYH\...` unless separately requested.
- Editing the thesis `chapters/`, `fig/`, `ref.bib`, or LaTeX build outputs.
- Reworking the full diagram aesthetics in the provided screenshot beyond fixing duplicate label representation.
- Removing sidecar support from the CLI.
- Removing Trellis or repo-local `.agents` infrastructure.

## Open Questions

No blocking product questions remain for planning. Recommended default temp root: a project-local hidden directory such as `.drawio-tmp/` or `.drawio-work/`, with per-output subdirectories to avoid collisions.
