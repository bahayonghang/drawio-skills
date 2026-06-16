# Draw.io Drawing Quality Improvement Design

## Scope Reset

The user clarified that this task should not consider Visio-to-draw.io conversion. Treat `ref/Auto-Visio-Helper` as a reference for good diagram-authoring workflow only. The implementation target is better draw.io drawing behavior in the existing `drawio` and `drawio-academic-skills` skills.

## Evidence Read

- `ref/Auto-Visio-Helper/SKILL.md`
- `ref/Auto-Visio-Helper/references/diagram_types.md`
- `ref/Auto-Visio-Helper/references/style_guide.md`
- `skills/drawio/SKILL.md`
- `skills/drawio-academic-skills/SKILL.md`
- `skills/drawio/references/workflows/create.md`
- `skills/drawio/references/workflows/replicate.md`
- `skills/drawio/references/docs/design-system/specification.md`
- `skills/drawio/references/docs/academic-figure-playbook.md`
- `skills/drawio/references/docs/academic-export-checklist.md`
- `skills/drawio-academic-skills/references/docs/publication-overlay.md`
- existing evals and policy tests under `skills/**/evals/` and `tests/`

## Useful Auto-Visio Ideas For draw.io

These ideas are portable because they improve diagram thinking rather than relying on Visio:

- Classify the diagram request before drawing.
- Ask only blocking questions.
- Produce a reviewable design brief or diagram plan before rendering complex figures.
- Convert vague requests into structured, verifiable geometry and labels.
- Rebuild reference images as editable primitives, not pasted screenshots.
- Export a preview and compare it against the confirmed plan/source.
- Apply restrained scientific styling: short labels, consistent spacing, readable fonts, controlled colors, black-white readability where relevant.
- Support common research diagram families: model architecture, method workflow, system architecture, experiment design, concept figure, pseudo-code/sequence/interaction.

## Current draw.io Strengths

The current repo already has the right foundations:

- YAML is canonical and schema-validated.
- `.drawio` and `.svg` are default final deliverables.
- Sidecars are separated into `.drawio-tmp/<name>/`.
- SVG/Desktop artifact verification is already policy.
- Base skill and academic overlay responsibilities are split.
- The YAML schema supports `meta.profile`, `meta.figureType`, `meta.canvas`, `bounds`, `labelOffset`, `modules`, semantic node types, and style overrides.
- Deep-learning semantic types already exist in the converter, including `conv`, `pool`, `attention`, `norm`, `tensor3d`, `operator`, and related types.
- Existing evals already cover evidence-chain planning, image-improvement preview gates, text/formula/edge-label placement, and Desktop fallback behavior.

## Gaps To Improve

The drawio skills can draw better if they make the scientific/research workflow more explicit:

1. Scientific diagram taxonomy is scattered. The academic overlay talks about paper logic, but the base and examples could make model architecture, method workflow, experiment design, and reference-image redraw patterns easier for an agent to follow.
2. Existing neural-network example is too generic and does not exercise the extended deep-learning semantic types.
3. The max-pooling or operation-style figure pattern is absent; this is useful for algorithm/mechanism explanation diagrams.
4. Evals include academic figure workflows but not enough concrete "draw a better scientific drawio figure" prompts.
5. The plan/spec gate should be more visible for complex scientific diagrams without forcing unnecessary confirmation for simple diagrams.

## Recommended Architecture

Do not add a new skill or new renderer. Improve the existing surfaces:

- `skills/drawio`: shared base behavior, general scientific/technical diagrams, reusable examples, common create/replicate guidance.
- `skills/drawio-academic-skills`: publication-facing routing, paper-readability gates, venue/caption/legend/formula policy.
- `skills/drawio/references/examples/`: concrete YAML examples agents can imitate.
- `skills/**/evals/evals.json`: skill-creator test prompts and assertions.
- `tests/`: policy and eval-split regression guards.

This keeps the repository coherent and avoids routing ambiguity.

## Proposed Improvements

### 1. Drawio Scientific Drawing Guidance

Add explicit guidance to existing docs, not SKILL.md frontmatter:

- In `create.md`, make scientific diagram classification explicit:
  - model architecture;
  - method workflow;
  - experiment design;
  - system architecture paper figure;
  - mechanism/operation figure;
  - reference-image redraw.
- In `academic-figure-playbook.md` and/or `publication-overlay.md`, sharpen paper-facing patterns:
  - architecture: modules/layers/static relationships;
  - workflow: ordered method/experiment/procedure;
  - roadmap: study phases/progression;
  - operation/mechanism: compact explanatory figure with small grids, formulas, callouts, and arrows.
- In `replicate.md`, preserve the native-rebuild rule and add scientific redraw priorities:
  - text fidelity;
  - formulas;
  - captions/legends;
  - edge label clearance;
  - source palette or grayscale-safe normalization.

### 2. Better Examples

Add examples that use current DSL fields before adding any schema:

- `yolo-model-architecture-paper.yaml`
  - `meta.profile: academic-paper`
  - `meta.figureType: architecture`
  - modules for Backbone, Neck/Fusion, Head, Loss/Output
  - semantic types such as `input`, `conv`, `attention`, `feature`, `output`, `loss`
  - compact labels and academic theme.
- `max-pooling-operation-paper.yaml`
  - native rectangles for grids;
  - `type: text` or formula annotations with explicit `bounds`;
  - arrows with `labelOffset`;
  - `meta.figureType: workflow` or architecture depending on final wording.

These examples should render with the existing CLI and be visually checked through exported SVG.

### 3. Evals For Better Drawing

Extend evals with concrete prompts:

- `academic-yolo-model-architecture`
  - should route to academic overlay;
  - should use architecture figure type;
  - should use modules and deep-learning semantic types;
  - should deliver `.drawio` + `.svg` with sidecars in `.drawio-tmp`.
- `academic-max-pooling-operation-figure`
  - should build native grid cells rather than embed an image;
  - should keep formula/callout text readable;
  - should run exported-artifact verification.
- `academic-reference-redraw-native-scientific`
  - should use `meta.source: replicated`;
  - should preserve captions, labels, formulas, and connector label offsets;
  - should not paste the reference image as the page.
- Optional base eval:
  - `base-scientific-non-publication-diagram` for non-paper technical mechanism diagrams that should not force academic gates.

### 4. Tests

Keep tests narrow:

- Update `tests/drawio-academic-skill.test.js` if new academic eval IDs are added.
- Keep `tests/skill-metadata.test.js` passing by avoiding frontmatter expansion.
- Keep `tests/visual-verification-policy.test.js` passing by preserving exported-artifact-first policy.
- If examples expose validation gaps, add targeted tests only for real behavior changes.

## Explicit Non-Goals

- No Auto-Visio JSON adapter.
- No Visio, COM, `pywin32`, or `.vsdx` support.
- No second canonical spec format.
- No browser/MCP requirement for normal drawio drawing.
- No broad refactor of the renderer unless examples fail because of a proven DSL limitation.

## Success Shape

After implementation, prompts like "draw a paper-ready YOLO architecture", "draw a max-pooling operation figure", or "redraw this research framework screenshot as editable draw.io" should reliably produce a plan or YAML spec that uses native draw.io cells, renders to `.drawio` and `.svg`, keeps sidecars in the work directory, and passes exported-artifact visual verification.
