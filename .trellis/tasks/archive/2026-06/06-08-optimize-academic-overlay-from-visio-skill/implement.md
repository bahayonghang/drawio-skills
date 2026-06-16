# Implementation Plan

## Checklist

1. Re-read relevant context before editing.
   - `skills/drawio-academic-skills/SKILL.md`
   - `skills/drawio-academic-skills/references/docs/publication-overlay.md`
   - `tests/drawio-academic-skill.test.js`
   - `tests/visual-verification-policy.test.js`
   - `skills/drawio-academic-skills/evals/evals.json`
   - `skills/drawio-academic-skills/evals/baseline-prompts.json`

2. Update the overlay entrypoint.
   - Add an academic source-understanding section.
   - Add a diagram-plan confirmation gate for complex or ambiguous source-derived figures.
   - Add optional external image-generation preview guidance:
     - default to image preview for complex paper-derived figures and reference-image redraws that need academic improvement,
     - skip image preview for simple academic diagrams and proceed directly to YAML/SVG,
     - only after plan confirmation,
     - ask before external processing of unpublished/confidential/sensitive source material,
     - send short labels and layout/style intent instead of raw documents,
     - treat image-model text as approximate and correct final labels in YAML,
     - fall back to local YAML/SVG when unavailable or declined.
   - Clarify that exported `.svg` or Desktop-exported artifact remains the authoritative draw.io preview/check path, not Visio or pasted raster reconstruction.
   - Add one-pass artifact QA rules.
   - Keep metadata description under 1024 UTF-8 bytes.

3. Expand the publication overlay reference.
   - Add paper-type routing:
     - algorithm or optimization,
     - empirical study,
     - mechanism study,
     - system architecture,
     - experimental study,
     - review or policy paper.
   - Add research evidence-chain extraction.
   - Add diagram plan template.
   - Add content compression and visual composition rules.
   - Add optional image-preview prompt guidance and privacy rules.
   - Add exported-artifact preview and one-pass QA checklist.

4. Update eval coverage.
   - Add a paper-derived figure eval that requires evidence-chain extraction, diagram-plan confirmation, optional image preview privacy/fallback handling, and existing `meta.figureType` mapping.
   - Add a reference-image academic redraw eval that requires ambiguity capture, optional preview/export confirmation, text placement, and one-pass QA.
   - Mirror new prompts in `baseline-prompts.json`.

5. Update tests.
   - Extend `tests/drawio-academic-skill.test.js` so it verifies:
     - overlay still has no copied base resources,
     - overlay still references sibling base,
     - overlay contains the new source/planning/image-preview/export-preview/QA policy,
     - academic eval set includes the new cases.
   - Only update `tests/visual-verification-policy.test.js` if the new QA wording needs a dedicated assertion.

6. Run focused verification.
   - `npm test -- tests/drawio-academic-skill.test.js` if the local test runner supports file arguments; otherwise run `node --test tests/drawio-academic-skill.test.js`.
   - `npm test`.

7. Run final local gates.
   - `just lint` because Markdown files changed.
   - `just ci` before final completion unless blocked by missing local tools or unrelated environment failures.

8. Review diff before reporting.
   - Confirm no `scripts/`, `assets/`, `styles/`, or shared base reference copies were added to the overlay.
   - Confirm sidecar/final-artifact language still matches current tests.
   - Confirm no external image-generation dependency became required.

## Risky Files and Rollback Points

- `skills/drawio-academic-skills/SKILL.md`
  - Risk: frontmatter description exceeds installer limit.
  - Rollback: reduce description text, keep detailed rules in body/reference.
- `skills/drawio-academic-skills/SKILL.md`
  - Risk: external image preview wording makes image generation sound required or bypasses privacy.
  - Rollback: move details into the reference doc and keep the entrypoint to short optional/fallback rules.
- `skills/drawio-academic-skills/references/docs/publication-overlay.md`
  - Risk: Markdown lint failures or overly broad policy that conflicts with YAML-first flow.
  - Rollback: keep only source-understanding and plan-gate sections.
- `tests/drawio-academic-skill.test.js`
  - Risk: over-specific text assertions create brittle tests.
  - Rollback: assert stable concepts rather than exact paragraphs.
- `skills/drawio-academic-skills/evals/*.json`
  - Risk: invalid JSON or duplicate eval IDs.
  - Rollback: validate JSON and keep IDs unique with `academic-` prefix.

## Validation Commands

```bash
node --test tests/drawio-academic-skill.test.js
npm test
just lint
just ci
```

If `just ci` is too broad for an intermediate checkpoint, run it before final handoff after the focused tests pass.

## Review Gate Before Implementation

Implementation should not start until the user reviews the planning artifacts or explicitly asks to start implementation.
