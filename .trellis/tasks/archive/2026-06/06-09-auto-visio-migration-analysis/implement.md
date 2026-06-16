# Implementation Plan

Status: in progress. The user approved starting implementation after confirming that existing `skills/` content has no Visio-related references.

## Implementation Scope

Implement the recommended drawio-only MVP:

- update existing drawio/academic guidance for better scientific diagram creation;
- add concrete drawio YAML examples;
- add or update eval prompts and assertions;
- update policy/eval tests as needed;
- do not implement Visio conversion or an Auto-Visio JSON adapter.

## Ordered Steps

### 1. Pre-Development Context

- Load `trellis-before-dev`.
- Re-read:
  - `.trellis/spec/frontend/component-guidelines.md`
  - `.trellis/spec/frontend/state-management.md`
  - `.trellis/spec/frontend/type-safety.md`
  - `.trellis/spec/frontend/quality-guidelines.md`
- Re-check `git status --short`.

Verification:

- Current task is in progress only after `python ./.trellis/scripts/task.py start .trellis/tasks/06-09-auto-visio-migration-analysis`.
- No unrelated dirty files are touched.

### 2. Improve Drawio Scientific Workflow Guidance

Edit existing docs rather than expanding SKILL.md frontmatter:

- `skills/drawio/references/workflows/create.md`
  - add explicit scientific diagram classification and plan gate guidance;
  - make model architecture, method workflow, experiment design, and operation/mechanism figures easier to route.
- `skills/drawio/references/workflows/replicate.md`
  - add scientific redraw priorities for captions, legends, formulas, text boxes, edge labels, and native cells.
- `skills/drawio/references/docs/academic-figure-playbook.md`
  - sharpen academic figure patterns for model architecture, operation/mechanism diagrams, and experiment workflows.
- `skills/drawio-academic-skills/references/docs/publication-overlay.md`
  - keep publication-only policy but make scientific figure source understanding more actionable.

Verification:

- Base remains general-purpose.
- Academic overlay remains thin and publication-policy-only.
- No new MCP/browser dependency is introduced.
- Frontmatter descriptions remain under installer limits.

### 3. Add Better Drawio Examples

Add examples under `skills/drawio/references/examples/`:

- `yolo-model-architecture-paper.yaml`
  - academic profile;
  - architecture figure type;
  - modules for model stages;
  - deep-learning semantic types where useful;
  - compact paper-readable labels.
- `max-pooling-operation-paper.yaml`
  - native grid cells;
  - operation block;
  - output grid;
  - formula/text annotations with explicit `bounds`;
  - arrows/labels that avoid collisions.

Render examples during verification with temporary output paths:

```powershell
node skills/drawio/scripts/cli.js skills/drawio/references/examples/yolo-model-architecture-paper.yaml <tmp>\yolo.svg --validate --write-sidecars --sidecar-dir <tmp>\.drawio-tmp\yolo --strict-warnings
node skills/drawio/scripts/cli.js skills/drawio/references/examples/max-pooling-operation-paper.yaml <tmp>\max-pooling.svg --validate --write-sidecars --sidecar-dir <tmp>\.drawio-tmp\max-pooling --strict-warnings
```

Do not commit temporary rendered artifacts unless they are intentionally added as docs assets.

### 4. Add Or Update Evals

Use `$skill-creator` expectations for testability.

- Add academic evals to `skills/drawio-academic-skills/evals/evals.json`:
  - `academic-yolo-model-architecture`
  - `academic-max-pooling-operation-figure`
  - `academic-reference-redraw-native-scientific`
- Add a base eval only if the final edits create a clearly non-publication scientific drawio path.
- Assertions should cover:
  - correct base vs academic routing;
  - plan/spec gate for complex diagrams;
  - native editable draw.io primitives;
  - no full-page embedded reference image;
  - `.drawio` + `.svg` final deliverables;
  - sidecars in `.drawio-tmp/<name>/`;
  - exported-artifact verification before browser screenshots.

Skill-creator follow-up:

- Create/maintain evals JSON.
- Run `eval-viewer/generate_review.py` when actual skill outputs are generated so the human can review test cases before further iteration.

Verification:

- `tests/drawio-academic-skill.test.js` passes or is updated intentionally for new eval IDs.
- Evals remain split: base eval IDs should not start with `academic-`; academic eval IDs should start with `academic-`.

### 5. Validation Gate

Run targeted checks:

```powershell
node --test tests/drawio-academic-skill.test.js
node --test tests/visual-verification-policy.test.js
node --test tests/skill-metadata.test.js
```

If examples or docs expose runtime changes, also run:

```powershell
node --test tests/adapters.test.js
node --test skills/drawio/scripts/dsl/spec-to-drawio.test.js
```

Run broad checks before reporting implementation complete:

```powershell
npm test
just ci
```

If public VitePress docs are edited, run:

```powershell
npm run docs:build
```

## Rollback Points

- If SKILL.md frontmatter length fails, move details back into reference docs.
- If an example needs unsupported DSL behavior, simplify the example first; split renderer/schema work into a separate task only if there is a real gap.
- If policy tests become brittle, assert policy intent rather than exact prose.
- If eval additions blur base vs academic responsibilities, move the prompt to the correct eval set.

## Final Review Checklist

- No Visio conversion or adapter work was added.
- YAML remains canonical.
- Final outputs remain `.drawio` and `.svg` by default.
- Sidecars remain in work directories.
- Base/academic boundaries remain intact.
- Examples validate and render.
- Evals cover better drawio drawing behavior.
- Exported artifact verification remains the visual QA path.
