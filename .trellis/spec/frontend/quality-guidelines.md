# Quality Guidelines

Code quality for this repository means preserving the YAML-first Draw.io
authoring contract, validating user-controlled inputs, keeping the base skill
and academic overlay boundaries intact, and proving changes with deterministic
Node tests plus docs/build checks when relevant.

---

## Overview

Use the smallest change that satisfies the requested behavior and keeps the
existing artifact model intact. The closest local CI command is `just ci`,
which runs version sync checks, Markdown linting, tests, and docs build. For a
narrow source-only change, `npm test` or the relevant `node --test` files can
be run first, but do not report completion without explaining which broader
gate was or was not run.

Repository examples:

- CLI and artifact behavior: `tests/integration.test.js`
- validation/security behavior: `tests/security.test.js`
- math behavior: `tests/math-typesetting.test.js` and
  `skills/drawio/scripts/math/index.test.js`
- skill metadata and policy behavior: `tests/skill-metadata.test.js` and
  `tests/visual-verification-policy.test.js`
- docs navigation/build surface: `docs/.vitepress/config.ts`

---

## Forbidden Patterns

- Do not make MCP, browser sessions, or Playwright screenshots required for
  normal create/edit/import/export work.
- Do not deliver a replicated diagram as one full-page embedded reference
  image. Final diagrams should be native editable Draw.io content.
- Do not copy base runtime resources into
  `skills/drawio-academic-skills/`; the overlay depends on sibling `../drawio`.
- Do not write scratch JS scripts under a user's project-local
  `.agents/skills/drawio` as part of normal diagram generation.
- Do not put `.spec.yaml` and `.arch.json` in final delivery directories by
  default; use an explicit work directory with `--sidecar-dir`.
- Do not generate discouraged math delimiters (`$...$`, `\[...\]`, or bare
  LaTeX commands) in labels.
- Do not silence invalid input, unknown file formats, Desktop export failures,
  malformed YAML, unsafe icon names, or invalid XML.
- Do not update only English or only Chinese docs when a public docs behavior
  is mirrored in both trees.

---

## Required Patterns

Always preserve these repository contracts:

- YAML remains the canonical source for diagram geometry, labels, formulas,
  captions, and metadata.
- Validate specs before rendering and validate XML before claiming exported
  artifacts are good.
- Prefer exported SVG or Desktop-exported artifacts for visual verification
  before browser screenshots.
- Add or update tests for behavior changes in CLI flags, DSL parsing, math
  normalization, XML/SVG conversion, Desktop detection, artifact placement, or
  skill policy text.
- Keep version metadata synchronized through `scripts/version-sync.js` when a
  release version changes.

### Draw.io CLI Artifact Contract

#### 1. Scope / Trigger

- Trigger: CLI changes that affect `.drawio`, `.svg`, `.spec.yaml`, or `.arch.json` output placement.
- Applies to `skills/drawio/scripts/cli.js`, skill instructions, evals, and docs that show default create/export commands.

#### 2. Signatures

- Default clean final output with work-dir sidecars:
  `node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars --sidecar-dir .drawio-tmp/output`
- Explicit beside-output sidecars remain supported:
  `node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars`
- `--sidecar-dir <dir>` is valid only with `--write-sidecars`.

#### 3. Contracts

- Final delivery directories should contain only final artifacts by default:
  - `.drawio`
  - `.svg`
- Intermediate sidecars should be written to the provided work directory:
  - `.spec.yaml`
  - `.arch.json`
- SVG output with `--write-sidecars --sidecar-dir <dir>` still writes the `.drawio` companion beside the final SVG, but writes `.spec.yaml` and `.arch.json` into `<dir>`.
- `--export-spec --write-sidecars --sidecar-dir <dir>` writes both exported spec and arch metadata into `<dir>`.

#### 4. Validation & Error Matrix

- `--sidecar-dir` missing value -> non-zero exit with `--sidecar-dir requires a directory path`.
- `--sidecar-dir` without `--write-sidecars` -> non-zero exit with `--sidecar-dir requires --write-sidecars`.
- Uncreatable sidecar directory -> non-zero exit with a directory creation error.

#### 5. Good/Base/Bad Cases

- Good: `.svg` output directory contains only `name.svg` and `name.drawio`; `.drawio-tmp/name/` contains `name.spec.yaml` and `name.arch.json`.
- Base: `--write-sidecars` without `--sidecar-dir` keeps legacy beside-output sidecars for explicit reproducible bundles.
- Bad: skill docs or evals describe `.spec.yaml` and `.arch.json` as default final deliverables.

#### 6. Tests Required

- CLI integration tests for `.drawio`, `.svg`, and `--export-spec` with `--sidecar-dir`.
- Policy tests that skill docs separate final deliverables from intermediate sidecars.
- Regression tests when edge label XML changes affect rendered `.drawio` or SVG output.

#### 7. Wrong vs Correct

Wrong:

```bash
node skills/drawio/scripts/cli.js input.yaml final/figure.svg --validate --write-sidecars
```

Correct for default final delivery:

```bash
node skills/drawio/scripts/cli.js input.yaml final/figure.svg --validate --write-sidecars --sidecar-dir .drawio-tmp/figure
```

### Draw.io Vision Preview and Rework Contract

#### 1. Scope / Trigger

- Trigger: changes to Desktop export profiles, PNG inspection, visual-review
  instructions, or YAML-first rework evidence.
- Applies to `skills/drawio/scripts/cli.js`, `scripts/runtime/desktop.js`,
  `scripts/runtime/vision-preview.js`, `scripts/runtime/png-inspection.js`, and
  the shared visual-review workflow.

#### 2. Signatures

- CLI preview:
  `node skills/drawio/scripts/cli.js input.yaml .drawio-tmp/figure/figure.preview.png --validate --visual-preview`
- Desktop profile:
  `buildDrawioExportArgs({ inputFile, outputFile, format: 'png', profile: 'vision-preview', width | height })`
- Orchestrator:
  `exportVisionPreview({ inputFile, outputFile, maxDimension = 2000, ...injectedDependencies })`
- Stabilization:
  `waitForStableFile(path, { stat, now, wait, timeoutMs, pollIntervalMs, stableSamples, maxPolls })`

#### 3. Contracts

- `vision-preview` is PNG-only, omits embedded XML and raster scale flags, and
  writes to a work/diagnostic path. It never replaces the existing final
  300dpi embedded export.
- Export by width first. Inspect IHDR after the output becomes stable; if
  height exceeds 2000px, overwrite the same path with a height-bounded export.
- Remove the prior preview before the first export so a failed or unavailable
  Desktop run cannot leave a stale PNG that looks current.
- The accepted preview has a valid PNG signature/IHDR/chunk traversal,
  terminal IEND, and `max(width, height) <= 2000`.
- Repair only the exact recognized terminal IEND truncation. Unknown chunk
  truncation, trailing bytes, malformed IHDR, and non-PNG input are rejected.
- Deterministic layout and label-collision checks are heuristics. A zero-warning
  result does not replace inspection of the actual Desktop-exported PNG.
  Desktop may place edge-label offsets differently from the heuristic model.
- Visual issues bind to stable page/object IDs when available and patch the
  canonical YAML before validation and rerender. Never patch a preview image.
- `recorded fixture`, `command-executed`, `Desktop-executed`, and
  `model-executed` are distinct evidence states. Without provider/model
  metadata, visual inspection remains `missing evidence` for model execution.

#### 4. Validation & Error Matrix

- `--visual-preview` without an explicit `.png` output -> non-zero exit.
- `--visual-preview` with `--dpi` or `--export-spec` -> non-zero exit.
- Desktop unavailable -> write the standalone SVG fallback and state that no
  PNG vision-preview was produced; a stale target PNG must not remain.
- Output missing, growing, or never stable -> bounded timeout naming the path
  and duration.
- Width-bounded PNG has height over 2000px -> overwrite by height and inspect
  again.
- Final PNG still exceeds 2000px or lacks terminal IEND -> explicit failure.
- Exact known IEND-tail truncation -> atomic repair and reinspection.
- Any other PNG corruption -> rejection without modifying the original.
- Deterministic checks pass but exported PNG shows overlap/source mismatch ->
  record visual evidence, patch YAML, validate, and rerender before completion.

#### 5. Good/Base/Bad Cases

- Good: write a bounded work-dir PNG, inspect the real export, record stable
  IDs, patch YAML, and overwrite the same preview path for the next review.
- Base: Desktop is unavailable, so deliver the normal editable bundle and SVG
  fallback while marking PNG/model evidence as missing.
- Bad: infer visual quality from XML warnings alone, append IEND to arbitrary
  bytes, call an SVG fallback a PNG preview, or edit the generated raster.

#### 6. Tests Required

- Unit tests for final-vs-preview Desktop arguments, width/height profiles,
  late/stable/timeout output, PNG complete/repair/reject states, and dimension
  re-export.
- CLI integration tests for flag conflicts and honest Desktop-unavailable
  fallback reporting, including removal of a pre-existing stale PNG.
- File-backed evidence covering small, wide, tall, CJK, and dense-academic
  YAML, with deterministic source/render/path and canonical-patch assertions.
- Current-machine Desktop smoke evidence when available, followed by actual
  exported-artifact inspection; do not promote it to model-executed evidence
  without provider/model metadata.

#### 7. Wrong vs Correct

Wrong:

```text
The validator reported zero label collisions, so the diagram is visually complete.
```

Correct:

```text
The validator passed; now inspect the bounded Desktop PNG, record any visual issue against the canonical YAML ID, patch YAML, and rerender the same preview path.
```

### Draw.io Native Reference Rebuild Contract

#### 1. Scope / Trigger

- Trigger: changes to the YAML DSL, renderer, validation, replication docs, or evals that affect reference-image rebuilds.
- Applies to `skills/drawio/scripts/dsl/spec-to-drawio.js`, base replication workflows, specification docs, and eval assertions.

#### 2. Signatures

- `meta.canvas` accepts only omitted, `auto`, or `WIDTHxHEIGHT`.
- `validateSpec(spec)` rejects invalid `meta.canvas` values before rendering.
- `validateXml(xml)` reports full-page embedded image cells through the existing validation path.

#### 3. Contracts

- Reference rebuilds must use native editable draw.io cells for the main diagram: shapes, text, connectors, modules/groups, waypoints, labels, and styles.
- A temporary reference image may be used for analysis/tracing, but the final page must not be a pasted full-page raster copy.
- `meta.canvas: WIDTHxHEIGHT` sets a minimum page size, not a crop.
- Rendered dimensions are `max(autoSize, explicitCanvasSize)`, so content outside the explicit canvas remains visible.
- Small icon or motif image cells are allowed when they are not acting as the whole diagram.

#### 4. Validation & Error Matrix

- `meta.canvas: auto` or omitted -> current content-derived sizing.
- `meta.canvas: 1200x800` -> minimum `pageWidth="1200"` and `pageHeight="800"`.
- Content exceeds explicit canvas -> page expands beyond the explicit dimensions.
- Zero, negative, decimal, object, array, missing, or malformed canvas -> explicit validation error.
- Image-like vertex covering most of the page from near the origin -> XML validation error for a full-page embedded image.
- Small image icon or motif -> XML validation remains valid.

#### 5. Good/Base/Bad Cases

- Good: rebuild a screenshot from a reference inventory, set `meta.source: replicated`, use `meta.canvas` for source coordinates, render native cells, and validate exported artifacts.
- Base: generated diagrams without reference-coordinate fidelity omit `meta.canvas` or use `auto`.
- Bad: final `.drawio` contains one image cell that covers the page while native shapes are missing.

#### 6. Tests Required

- Unit tests for explicit canvas dimensions and expansion beyond the explicit canvas.
- Validation tests for invalid canvas values.
- XML validation tests for full-page image rejection and small image allowance.
- Eval coverage for native reference rebuilds with inventory, explicit canvas, exported-artifact verification, and no full-page image embed.

#### 7. Wrong vs Correct

Wrong:

```yaml
nodes:
  - id: screenshot
    type: service
    style:
      shape: image
      image: data:image/png;base64,...
    bounds: { x: 0, y: 0, width: 1200, height: 800 }
```

Correct:

```yaml
meta:
  source: replicated
  canvas: 1200x800
nodes:
  - id: extract
    label: Extract
    type: service
    bounds: { x: 80, y: 144, width: 168, height: 56 }
edges:
  - from: extract
    to: train
    label: features
    waypoints:
      - { x: 320, y: 172 }
    labelOffset: { x: 0, y: -16 }
```

### Bundled Image Icon Contract

#### 1. Scope / Trigger

- Trigger: changes to non-stencil `lobe.*`, `ai.*`, `brand.*`, or `lucide.*`
  resolution, documentation, dependencies, or validation.
- Applies to `skills/drawio/scripts/dsl/icon-resolver.js`, DSL tests, package
  metadata, icon references, and third-party license assets.

#### 2. Signatures

- `resolveImageIconStyle(icon)` returns a complete Draw.io image style or
  `null`.
- `loadAiIconCatalog()` reads and validates the fixed bundled catalog once;
  `getAiIcon(slug)` returns an immutable record or `null`.
- `searchAiIcons(query, { limit })` returns deterministic catalog-search
  records with canonical `icon: lobe.<slug>` syntax.
- `validateShapeReferences(spec)` reports unsupported image-icon names through
  the existing unknown-shape warning path.

#### 3. Contracts

- Every successful image-icon resolution embeds an SVG data URI; normal
  rendering and reopening must not require HTTP(S) access.
- Runtime support is a finite set owned by the checked-in
  `assets/catalog/ai-icons.json.gz`, `LUCIDE_PATHS`, and `BRAND_SVGS`.
  Compatibility identifiers and slug aliases must resolve into that same set.
- `icon-resolver.js` must not discover packages or read files. The independent
  `ai-icon-catalog.js` loader may read only its fixed sibling asset path, uses
  one module cache, and must not inspect `node_modules`, environment variables,
  a user home cache, or arbitrary runtime paths. A copied `skills/drawio`
  directory keeps the same image-icon support set.
- Full-name compatibility runs before canonical exact lookup; slug aliases run
  only after an exact miss. `lobe.anthropic` is exact Anthropic while
  `ai.anthropic` remains the documented Claude compatibility exception.
- New embedded third-party icon data must include its license under
  `skills/drawio/assets/licenses/`.

#### 4. Validation & Error Matrix

- Documented embedded icon -> `shape=image` style containing
  `image=data:image/svg+xml,...`.
- Supported alias -> same embedded result as its canonical name.
- Missing/corrupt gzip, wrong schema/provenance/count, duplicate slug, or
  unsorted records -> throw an `AI icon catalog ...` error; do not degrade to
  an unknown icon.
- Unknown `lobe.*`, `ai.*`, `brand.*`, or `lucide.*` -> resolver returns
  `null`; shape-reference validation emits an unknown-shape warning.
- Non-AI stencil, Redis, Lucide, and ordinary icon resolution -> do not read
  the AI catalog.
- Unsafe icon characters -> existing icon validation rejects the spec before
  rendering.

#### 5. Good/Base/Bad Cases

- Good: `lobe.openai` and `lucide.server-cog` resolve to embedded SVG data.
- Base: provider stencils such as `aws.lambda` continue through the existing
  Draw.io stencil resolver.
- Bad: constructing a CDN URL for any syntactically safe slug, or requiring a
  repository-root icon package that a skill-only install does not carry.
- Bad: catching catalog corruption and returning `null`, which makes a broken
  release indistinguishable from an unknown brand.

#### 6. Tests Required

- Assert every documented embedded name and alias returns a data URI with no
  remote image URL.
- Iterate every checked-in slug through both `lobe.*` and `ai.*`, including the
  documented `ai.anthropic` exception.
- Inject the loader read boundary to prove one successful read, one cached hard
  failure, and zero reads for Redis/Lucide/ordinary icons.
- Assert representative unknown names return `null` and produce warnings.
- Assert package metadata and resolver source do not reintroduce the removed
  runtime icon dependency, package discovery, or CDN fallback.

#### 7. Wrong vs Correct

Wrong:

```js
return `shape=image;image=https://cdn.example/icons/${slug}.svg`
```

Correct:

```js
const record = getAiIcon(slug) // fixed bundled gzip, validated and cached
return record ? embeddedImageStyle(record.svg) : null
```

### Academic Overlay Image Preview Contract

#### 1. Scope / Trigger

- Trigger: changes to `skills/drawio-academic-skills/` instructions, evals, or tests that mention source-derived academic figures, uploaded/reference-image redraws, external image generation, preview approval, or final artifact verification.

#### 2. Signatures

- Canonical execution stays in the sibling base skill:
  `node ../drawio/scripts/cli.js input.yaml final/figure.svg --validate --write-sidecars --sidecar-dir .drawio-tmp/figure`
- External image-generation preview has no bundled command, dependency, API key, or required client in this repo.

#### 3. Contracts

- YAML remains the canonical source for final geometry, labels, formulas, captions, and metadata.
- Final academic deliverables remain `.drawio` and `.svg` by default, with `.spec.yaml` and `.arch.json` in an explicit work directory.
- External image generation may be used only as an optional concept preview for structure, hierarchy, and academic tone.
- Use the image preview by default only for complex paper-derived figures or reference-image redraws that need academic improvement.
- Simple, clear academic diagrams should proceed directly to YAML/SVG.
- Ask before sending unpublished, confidential, proprietary, or sensitive source material to an external image model.
- Prefer sending the confirmed diagram plan, short labels, layout intent, and style constraints instead of raw documents.
- Exported SVG or Desktop-exported artifacts remain the authoritative visual QA target.

#### 4. Validation & Error Matrix

- No image-generation tool available -> fall back to local YAML/SVG preview.
- User declines external processing -> fall back to local YAML/SVG preview.
- Image model returns incorrect text -> correct final labels and formulas in YAML before export.
- Exported artifact shows overlap, clipped text, connector-label collision, arrows crossing text/nodes, missing modules, or plan mismatch -> correct YAML and rerender once before final reporting.

#### 5. Good/Base/Bad Cases

- Good: complex paper-derived figure -> evidence-chain extraction -> confirmed diagram plan -> privacy-gated concept preview -> YAML -> `.drawio`/`.svg` export QA.
- Base: simple workflow figure with known labels and layout -> direct YAML/SVG without image preview.
- Bad: treating a generated raster image as the final artifact, uploading raw unpublished paper text without approval, or adding a required image-generation dependency to the overlay.

#### 6. Tests Required

- Policy tests should assert the overlay still references sibling `../drawio` and does not copy base runtime resources.
- Eval coverage should include at least one paper-derived evidence-chain case and one reference-image academic-improvement preview case.
- Metadata tests must continue to keep skill frontmatter within installer limits.

#### 7. Wrong vs Correct

Wrong:

```text
Use image generation as the final diagram, then skip draw.io export verification.
```

Correct:

```text
Use image generation only as an optional concept preview, then correct YAML and verify the exported draw.io SVG.
```

---

## Testing Requirements

- Use Node's built-in test runner: `node:test` and `node:assert/strict`.
- Run `npm test` or `just test` for runtime changes.
- Run targeted tests first when isolating a failure, for example:
  `node --test tests/security.test.js`.
- Run `npm run docs:build` or `just docs-build` for VitePress docs changes.
- Run `just lint` when Markdown docs under `docs/`, `skills/`, or `README*.md`
  change.
- Run `just version-check` after any version metadata change.
- Run `just ci` before final completion when the change touches shared CLI,
  DSL, docs, skill policy, or release/version surfaces.
- For policy-only wording tests, make assertions policy-oriented and
  case-insensitive where possible; avoid brittle exact prose unless exact text
  is the contract.

---

## Code Review Checklist

- Does the change preserve the base vs academic overlay boundary?
- Does YAML remain the source of truth and do derived artifacts stay derived?
- Are `.drawio` and `.svg` final deliverables kept separate from work-dir
  sidecars by default?
- Are user-controlled YAML, XML, icon, theme, style, path, and environment
  inputs validated before use?
- Are validation errors explicit and actionable?
- Are source, docs, skill instructions, evals, and tests updated together when
  behavior crosses those surfaces?
- Did the author run the relevant targeted tests and the broad gate, or clearly
  explain why a gate could not run?
- For docs changes, are English and `docs/zh/` pages both considered when the
  public behavior is bilingual?
