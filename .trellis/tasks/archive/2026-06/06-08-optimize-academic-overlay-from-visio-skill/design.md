# Technical Design

## Architecture and Boundaries

This task updates the academic overlay policy and tests. It does not add a new renderer or bundled image client.

Keep the existing split:

- `skills/drawio-academic-skills/` owns publication-facing policy, routing, source understanding, confirmation gates, and evals.
- `skills/drawio/` owns the shared YAML DSL, CLI, schemas, themes, workflow guides, export runtime, and validation logic.

The Visio skill's COM automation and PowerShell scripts are not portable and should not be moved into the draw.io overlay. The transferable value is its workflow structure:

1. source understanding,
2. diagram plan confirmation,
3. preview before final delivery,
4. editable final artifact,
5. exported preview inspection,
6. one bounded correction pass.

For draw.io, the corresponding implementation is:

1. source understanding -> overlay paper/image/text extraction guidance,
2. diagram plan confirmation -> an ASCII/logical plan and academic figure plan template,
3. optional concept preview -> available external image-generation tool after privacy-gated plan confirmation,
4. authoritative draw.io preview -> generated `.svg` or Desktop-exported artifact from the sibling base CLI,
5. editable final artifact -> `.drawio`,
6. exported preview inspection -> artifact-first visual self-check,
7. one bounded correction pass -> adjust YAML spec and rerender once when defects are found.

## Data Flow and Contracts

Academic create flow after the change:

```text
User source or prompt
  -> overlay preflight
  -> source understanding / research evidence chain
  -> diagram plan gate for complex or ambiguous requests
  -> optional external image-generation preview from confirmed plan and short labels for complex paper-derived figures
  -> preview approval or revision
  -> YAML spec with academic meta
  -> sibling base CLI validation/export
  -> exported SVG/Desktop artifact preview check
  -> one YAML correction pass if visible defects are found
  -> completion report with final artifacts and work directory
```

Academic replicate flow after the change:

```text
Uploaded/reference image
  -> visible structure and text-placement extraction
  -> ambiguity list for unreadable labels
  -> diagram plan / extraction confirmation
  -> optional external image-generation preview when academic improvement or layout exploration is needed
  -> preview approval or revision
  -> YAML spec with bounds and labelOffset when placement matters
  -> sibling base CLI validation/export
  -> original-vs-export artifact check
  -> one YAML correction pass if visible defects are found
```

## File-Level Plan

Primary edits:

- `skills/drawio-academic-skills/SKILL.md`
  - Add source-understanding and plan-gate rules.
  - Add optional external image-generation preview semantics with privacy gate and fallback.
  - Add draw.io-specific exported-artifact preview semantics.
  - Add one-pass artifact QA rules.
  - Keep frontmatter short enough for the 1024-byte metadata test.
- `skills/drawio-academic-skills/references/docs/publication-overlay.md`
  - Add detailed paper-type routing and research evidence chain.
  - Add diagram plan template.
  - Add content compression and academic visual style guidance derived from the Visio skill, rewritten for draw.io/YAML.
  - Add external image-preview prompt constraints and privacy rules.
  - Add exported-artifact preview and QA rules using sibling base CLI outputs.
- `skills/drawio-academic-skills/evals/evals.json`
  - Add source-paper and reference-image cases with assertions for planning gates, evidence-chain extraction, optional image preview privacy/fallback semantics, and one-pass QA.
- `skills/drawio-academic-skills/evals/baseline-prompts.json`
  - Mirror the new eval prompts.
- `tests/drawio-academic-skill.test.js`
  - Assert that new eval IDs exist.
  - Assert overlay guidance includes plan gate / research evidence chain / optional image preview privacy gate / exported SVG preview language while preserving no-MCP and sibling-base boundaries.

Potential secondary edits only if necessary:

- `tests/visual-verification-policy.test.js` if existing expectations need to include the new one-pass artifact QA wording.
- `docs/guide/scientific-workflows.md` and `docs/zh/guide/scientific-workflows.md` only if the user wants public docs updated in the same pass.

## Compatibility Notes

- Keep `meta.figureType` limited to the existing schema values: `architecture`, `roadmap`, and `workflow`.
- Do not introduce new required schema fields such as `paperType` unless a later task explicitly expands the base DSL.
- Paper-type routing should be guidance that maps to existing figure types and `meta.description`, not a schema-breaking contract.
- Do not add image-generation dependencies, API-key handling, or model-specific client code. The skill should use an available session image-generation tool when one exists.
- External image previews require privacy gating and should not replace YAML as the canonical source.
- The image preview is a concept/layout/style reference. Exact labels, formula text, figure metadata, and final geometry must be corrected in YAML and verified through exported draw.io artifacts.

## Trade-Offs

Default preview trigger:

- Use image-generation preview by default for complex paper-derived figures and reference-image redraws that need academic improvement.
- Skip image-generation preview for simple, straightforward academic diagrams and proceed directly to YAML/SVG.
- This preserves preview-first quality gains where layout ambiguity is high while avoiding unnecessary latency and privacy prompts for small tasks.

Optional image-model concept preview plus authoritative SVG preview:

- Pros: gives the user an early visual concept for complex academic figures while keeping the final source deterministic, editable, and private when fallback is used.
- Cons: adds a privacy decision, can produce unreliable text, and may tempt the agent to treat a raster preview as the final artifact unless the overlay is explicit.

Short-label external prompts instead of raw-source prompts:

- Pros: reduces confidentiality risk and improves visual focus.
- Cons: may omit nuance from the paper unless the diagram plan is prepared carefully first.

Overlay-only policy changes instead of base CLI validation changes:

- Pros: low risk, matches ADR boundaries, easier to test with existing textual and eval assertions.
- Cons: geometric checks like "edge crosses node interior" remain partly human/visual rather than fully automated.

One-pass correction policy:

- Pros: prevents endless polishing loops and matches the Visio skill's bounded QA idea.
- Cons: a second visible defect may remain and need user-requested follow-up.

## Rollback Shape

The change should be easy to revert because it is expected to touch only Markdown, eval JSON, and tests. If implementation causes metadata limits, privacy ambiguity, or overlay-resource tests to fail, rollback the overlay text/eval edits rather than changing the architectural tests.
