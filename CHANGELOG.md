# Changelog

All notable changes to this project are documented here.
Format follows Keep a Changelog; this project uses date-based entries.
This is the repository-level summary; authoritative per-skill detail lives in
`skills/drawio/CHANGELOG.md` and `skills/drawio-academic-skills/CHANGELOG.md`.

## [Unreleased]

Upstream capability integration — a batch of offline capabilities ported from
upstream `drawio-skill` behind the canonical boundary. Committed to the repo at
version `2.7.0`; not yet cut as a tagged release.

### Fixed

- **Self-contained base skill runtime**: vendored the mandatory
  `js-yaml@4.1.1` ESM runtime so copied `skills/drawio` installations no longer
  depend on repository-root or user-home packages.

### Added

- **Config and IaC importers**: declared Terraform, Kubernetes, Compose, SQL DDL,
  OpenAPI, GitHub Actions, and GitLab CI adapters (`--input-format terraform` /
  `kubernetes` / `compose` / `sql` / `openapi` / `github-actions` / `gitlab-ci`),
  each normalized to `CanonicalGraphProjection v1` with stable identity. Optional
  Python worker (`python-hcl2`, `sqlglot`) for HCL/SQL, isolated and offline.
- **Code relationship importers**: Python imports/classes, JavaScript/TypeScript
  ESM, Go, and Rust adapters from a bounded local project directory, using pinned
  optional parsers and never invoking a language toolchain.
- **Live snapshots and drift**: saved Terraform state/plan, Docker inspect, and
  Kubernetes live JSON adapters plus a deterministic architecture drift comparator
  and renderer; no provider CLI, daemon, or cluster capture.
- **Multi-page canonical bundles**: bundle v1 with stable page/object identity,
  structured page links, per-page validation, and `--all-pages --export-spec`
  round-trip through a single `<mxfile>` and arch v2 sidecar.
- **Postprocess suite**: offline `mermaid`, `explain`, `relabel`, `restyle`,
  `heatmap`, and script-free self-contained `html`, with `*.postprocess.json`
  provenance. Runbook, animated SVG, tube/sequence layout, compression, buildup,
  PPTX, timelapse, and PR diff remain deferred, not hidden commands.
- **Structured raster extraction**: `--input-format raster-extraction` normalizes a
  trusted, model- or human-produced extraction JSON into a canonical spec.
- **Offline AI icon catalog**: 309 licensed, offline `lobe.*` / `ai.*` brand SVGs
  with deterministic aliases through the shared icon resolver (no CDN lookup).
- **SysML/BPMN stencils**: searchable `mxgraph.sysml.*` and `mxgraph.bpmn.*` base
  names; source-row counts are not capability counts and nested constructs remain
  deferred.

### Documentation

- New docs-site pages (English and `docs/zh/`): Config and IaC Importers, Code
  Relationship Importers, Live Snapshots and Drift, Multi-page Bundles, Postprocess
  Suite, and an Upstream Capability Map, wired into the VitePress nav/sidebar.
- Updated CLI, workflows, getting-started, icons/stencils, and replicate guides,
  the home pages, and both root READMEs to cover the new routes. Footer bumped to
  `v2.7.0`.

## 2.7.0 (2026-07-14)

- **Palette system**: 15 metadata-backed academic, engineering, and general
  palettes that compose independently with themes through `meta.palette` and
  `$paletteN` tokens, with colorblind/grayscale/print diagnostics and intent-gated
  selection.

## 2.6.0 (2026-07-14)

- **Open arrowheads by default**: flow connectors and the untyped-edge fallback
  default to an open head (`endArrow=open`, `endSize=12`); block/classic remain on
  explicit request or for UML/ER semantics.
- **Default export is a 300dpi PNG** via draw.io Desktop, with automatic standalone
  SVG fallback when Desktop is unavailable.
- **arch-dark architecture design language**: new built-in theme, an `architecture`
  task route, and role-to-type architecture-diagram reference.

## 2.5.0 (2026-07-07)

- **Straight orthogonal routing** with a shared per-edge coordinate and a
  straightness audit in `validateEdgeQuality`.
- **Transparent text and label fidelity**: plain text nodes emit transparent
  fill/stroke/label background; content-aware default `labelOffset`.
- **Native connectors and arrowheads**, plus additive `validateXml` warnings for
  floating edges.

## 2.4.0 (2026-07-07)

- Quality round from the 2026-07-06 audit: offline SVG renderer fidelity
  (absolute geometry, boundary-anchored edges, orthogonal bends, multi-line labels).
- Vendored shape catalog v2 with `validateShapeReferences` so unknown stencil names
  warn instead of rendering empty boxes; offline `search` sub-command.
- Diagram font policy (unified CJK/Latin fonts and fill-based sizing).

## 2.3.0 (2026-06-16)

- Offline-first import/export workflow with canonical `.spec.yaml` / `.arch.json`
  sidecars.

## 2.2.0

Base/overlay split.

### Added

- Root `LICENSE` (MIT) for the repository.
- A dedicated `network-topology` task route in the Base Skill, plus an `ieee-network-diagrams` reference highlight, so base-side network and infrastructure diagrams reach that guide.
- `.prettierrc` matching the committed JS style (single quotes, no semicolons, 120-column width, no trailing commas), with a markdown override so prose and YAML frontmatter quoting are left untouched.

### Changed

- Split the Draw.io skill into a shared **Base Skill** (`skills/drawio`) and a thin **Academic Overlay** (`skills/drawio-academic-skills`); the overlay now depends on the sibling base instead of vendoring base runtime, references, themes, and schemas.
- Tightened the overlay boundary: removed duplicated reference docs, relocated the generic `style-extraction` guide and the vendored upstream pure-XML reference back into the base, and hardened the boundary test into a structural invariant.
- Rewrote both skill descriptions to remove the academic-keyword overlap so publication requests route to the overlay and general diagrams route to the base.
- Unified the project license to **MIT** across `package.json`, `package-lock.json`, the Base Skill `SKILL.md`, and the root README badges and text (the overlay was already MIT).
- Completed the Base Skill frontmatter (`homepage`, `compatibility`, `platforms`) and added an `argument-hint` to the overlay so the two sibling skills stay symmetric.
- Normalized existing JavaScript formatting with Prettier (pure formatting; no behavior change, tests unchanged).
- Fixed `AGENTS.md` to reference `references/workflows/` and to describe the Academic Overlay.

### Note

- The Academic Overlay is re-versioned to `0.1.0` as a reborn thin overlay (not a regression). All shared diagram-production capability lives in the Base Skill (repo version `2.2.0`); the overlay carries only publication policy.
