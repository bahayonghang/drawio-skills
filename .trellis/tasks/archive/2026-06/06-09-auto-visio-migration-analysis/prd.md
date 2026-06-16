# Improve draw.io scientific diagram drawing workflow

## Goal

Use `ref/Auto-Visio-Helper` only as a workflow and feature reference, then improve how this repository's draw.io skills guide agents to create better editable draw.io diagrams. The task is no longer about Visio-to-draw.io conversion, Auto-Visio JSON migration, or Visio runtime compatibility.

## User Value

- Make `skills/drawio` and `skills/drawio-academic-skills` better at drawing high-quality editable draw.io diagrams from natural-language requirements and reference images.
- Preserve the existing draw.io architecture: YAML-first, offline-first, base runtime plus thin academic overlay.
- Improve scientific/research diagram quality without introducing Visio, COM automation, or a second canonical spec.
- Keep the improvement testable through existing Node tests and skill-creator-style eval review.

## Confirmed Facts

- The user explicitly does not want Visio-to-draw.io conversion considered.
- The useful part of Auto-Visio for this task is its drawing workflow: classify diagram intent, produce a reviewable spec/plan, render editable primitives, export preview artifacts, and iterate from visual checks.
- Current draw.io skills already provide the right execution substrate:
  - canonical YAML spec;
  - `.drawio` and `.svg` final deliverables;
  - `.spec.yaml` and `.arch.json` sidecars in `.drawio-tmp/<name>/`;
  - exported-artifact-first visual verification;
  - `drawio` base skill for general diagrams;
  - `drawio-academic-skills` overlay for publication figures;
  - schema support for `meta.profile`, `meta.figureType`, `meta.canvas`, `bounds`, `labelOffset`, semantic node types, modules, and style overrides.

## Requirements

- Focus implementation on better draw.io diagram creation, not file-format migration.
- Clarify when to use the base skill versus academic overlay for scientific/research diagrams.
- Strengthen drawio planning guidance for:
  - model architectures such as CNN, YOLO, Transformer, encoder-decoder, attention, and feature fusion;
  - method workflows and experiment pipelines;
  - system architecture paper figures;
  - reference-image redraws into native editable draw.io cells.
- Improve docs/evals/examples so agents consistently:
  - plan the diagram before writing YAML when the structure is complex;
  - use native draw.io primitives rather than full-page embedded images;
  - keep labels concise and readable;
  - use `bounds`, `meta.canvas`, modules, semantic node types, and `labelOffset` where appropriate;
  - verify generated SVG/Desktop artifacts before browser screenshots.
- Preserve:
  - YAML as canonical source;
  - `skills/drawio` as shared runtime;
  - `drawio-academic-skills` as thin publication overlay;
  - clean final deliverables with sidecars in a work directory;
  - SKILL.md frontmatter description length limits.
- Include a validation and eval plan compatible with the existing test suite and `$skill-creator` workflow.
- Do not implement skill changes during planning unless the user explicitly approves implementation.

## Acceptance Criteria

- [x] A Trellis task exists for the analysis.
- [x] `prd.md` reflects the drawio-only scope.
- [x] `design.md` explains which Auto-Visio workflow ideas should inform better drawio drawing.
- [x] `implement.md` provides an ordered drawio-only implementation plan.
- [x] The plan excludes Visio-to-draw.io conversion and Auto-Visio JSON adapter work.
- [x] The plan includes a skill-creator eval/reviewer step, including creating eval JSON and running `eval-viewer/generate_review.py` when actual skill changes are made.
- [x] The user reviewed the drawio-only scope and approved starting implementation when no Visio-related content existed under `skills/`.

## Out of Scope

- Visio-to-draw.io conversion.
- Auto-Visio JSON -> draw.io YAML adapter.
- Rendering or parsing `.vsdx`.
- Adding Visio, `pywin32`, COM automation, or Visio template handling to draw.io.
- Creating a new parallel drawio scientific skill unless later evidence shows the base + academic overlay model cannot cover the need.
- Running a full skill-creator benchmark loop during planning.

## Open Questions

None blocking. The current recommended implementation is docs, examples, evals, and policy tests focused on better draw.io drawing quality.
