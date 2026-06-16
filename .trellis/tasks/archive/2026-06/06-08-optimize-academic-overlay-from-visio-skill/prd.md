# Optimize academic overlay from Visio skill

## Goal

Optimize `skills/drawio-academic-skills` by borrowing the useful workflow ideas from `ref/academic-diagram-to-visio` while preserving the current draw.io architecture:

- `drawio-academic-skills` remains a thin academic publication overlay.
- Shared execution remains in the sibling `../drawio` base skill.
- Authoring remains YAML-first and artifact-verified, with an optional privacy-gated external image-generation preview before final YAML rendering.
- The optimization improves source understanding, academic diagram planning, confirmation gates, preview semantics, and one-pass visual QA for paper/thesis/manuscript figures.

The user value is higher-quality academic diagrams from papers, reports, text prompts, and reference images without weakening the existing clean bundle, sidecar, and no-MCP guarantees.

## Confirmed Facts

- `ref/academic-diagram-to-visio` uses a gated workflow: understand source, propose a diagram plan, confirm, create a visual preview, confirm, reconstruct as editable Visio shapes, export preview, inspect once, and correct at most once.
- The Visio skill has strong academic-source extraction guidance: paper type, research chain, actors, assumptions, methods, validation, metrics, results, and contribution.
- The Visio skill's implementation depends on Windows Visio COM and PowerShell scripts. That mechanism is not portable to draw.io and should not be copied into the academic overlay.
- `skills/drawio-academic-skills` is currently an overlay that depends on sibling `../drawio` for CLI, schemas, themes, workflow guides, and runtime.
- ADRs require the academic overlay to avoid copied base scripts/resources and keep shared production capabilities in `../drawio`.
- Existing tests enforce that overlay `references/` contains only `docs/publication-overlay.md`, that base and academic evals have separate responsibilities, and that metadata descriptions remain under 1024 UTF-8 bytes.
- Existing draw.io workflows already support YAML-first creation, replication, edit/import, exported-artifact verification, sidecar separation, strict warnings, academic figure type validation, formula handling, and Desktop fallback reporting.

## Requirements

- Add richer academic source-understanding guidance to the overlay:
  - document/paper/report sources,
  - reference image or uploaded figure sources,
  - text-only academic figure requests.
- Add a paper-derived figure planning model inspired by the Visio skill:
  - paper type routing,
  - research evidence chain,
  - content compression,
  - dominant reading path,
  - support bands such as data, theory/assumptions, method, actors, validation, metrics, and contribution.
- Add an explicit diagram-plan confirmation gate for complex, ambiguous, paper-derived, or image-replication academic requests.
- Add optional external image-generation preview guidance:
  - use it only after the diagram plan is confirmed,
  - ask before sending unpublished, confidential, proprietary, or sensitive academic content to an external model,
  - prefer sending the confirmed plan, short labels, layout intent, and style constraints instead of raw source documents,
  - state that image-model text is only a structural/style preview and final labels must be corrected in YAML/draw.io,
  - fall back to local YAML/SVG preview when no image-generation tool exists, the call fails, or the user declines external processing.
- Map the Visio skill's "preview before final drawing" concept to draw.io correctly:
  - optionally use an external image-generation preview for early layout/style approval,
  - use generated `.svg` or Desktop-exported artifact as the authoritative preview/check path for final draw.io artifacts,
  - keep `.drawio` and YAML sidecars as editable/canonical artifacts,
  - do not add Visio-specific JSON specs or PowerShell automation.
- Add a bounded visual QA policy modeled after the Visio skill:
  - inspect exported artifacts first,
  - check overlap, clipped text, connector labels, arrows crossing text/nodes, missing modules, and mismatch from confirmed plan/source,
  - perform one focused correction pass before final reporting when visible defects are found.
- Preserve current overlay constraints:
  - no MCP/live backend requirement,
  - no copied base runtime/resources,
  - no required external image generation,
  - no raw sensitive source upload to external image models without user approval,
  - no final `.spec.yaml` / `.arch.json` beside final artifacts unless explicitly requested.
- Update eval prompts/assertions so the new behavior is testable for paper-derived and image-derived academic figures.
- Update tests only where needed to lock the overlay policy and eval coverage.
- Keep frontmatter metadata within installer limits.

## Acceptance Criteria

- [ ] `skills/drawio-academic-skills/SKILL.md` describes source understanding, diagram-plan confirmation, preview/export semantics, and one-pass artifact QA in draw.io terms.
- [ ] `skills/drawio-academic-skills/references/docs/publication-overlay.md` contains the detailed paper-type routing, research evidence chain, diagram plan template, content-compression guidance, and visual QA checklist.
- [ ] The overlay documents optional external image-generation preview with privacy approval, short-label prompt constraints, final-text correction in YAML, and local SVG fallback.
- [ ] The overlay still points to sibling `../drawio` for CLI, schemas, themes, references, workflows, and runtime; no shared base resources are copied into the overlay.
- [ ] Existing academic defaults remain valid: `meta.profile: academic-paper`, `meta.figureType` in `architecture | roadmap | workflow`, `.drawio + .svg` final outputs, `.spec.yaml + .arch.json` in a work directory.
- [ ] Academic evals include at least one source-paper/evidence-chain case and one reference-image/preview-confirmation case that assert the new planning and QA behavior.
- [ ] Tests assert the new overlay guidance without making the overlay carry forbidden copied resources.
- [ ] `npm test` passes.
- [ ] `just lint` passes if Markdown files are changed and the local Markdown toolchain is available.
- [ ] `just ci` is run before final completion unless blocked by missing local dependencies or an unrelated environment failure.

## Out of Scope

- Do not add Visio support, Visio COM automation, or PowerShell drawing scripts to draw.io skills.
- Do not add a second draw.io-specific JSON spec parallel to the existing YAML DSL.
- Do not make external image generation part of the required academic workflow.
- Do not add a bundled image-generation client, dependency, API key handling, or model-specific implementation. The overlay should describe how to use an available session image tool when one exists.
- Do not implement new visual geometry validation in base CLI unless planning review expands scope.
- Do not change the overlay's skill name or install identity.
- Do not rewrite unrelated docs or refactor base CLI internals as part of this task.

## Decision

- The user chose to add external image-generation preview guidance.
- The user chose the trigger rule: enable optional external image-generation preview by default for complex paper-derived figures or image-replication tasks that need academic improvement; keep simple diagrams on the direct YAML/SVG path.

Implementation interpretation: include external image-generation preview as an optional, privacy-gated design-preview phase after the confirmed diagram plan. It does not replace YAML as the canonical source, it does not replace exported SVG/Desktop artifact verification, and it must have a local fallback.

## Open Questions

- None. Planning is ready for user review.
