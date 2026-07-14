# Changelog — drawio base skill

## Unreleased

## 2.6.0 (2026-07-14)

### Open arrowheads by default

- Flow connectors (`primary`, `data`, `control`, `memory_read`, `memory_write`,
  `feedback`) and the untyped-edge fallback now default to an open head
  (`endArrow=open`, unfilled "V") instead of a filled `block`. Applied in the base
  connector map (`scripts/dsl/spec-to-drawio.js`), the AH adapter, and all 11 theme
  JSONs under `assets/themes/`.
- Open heads keep the bold `endSize=12` for visibility on 2px connectors;
  `optional`/`async` (already open) now also receive `endSize=12`.
- `endFill` now follows the arrowhead's own convention: an explicit `endArrow=block`
  renders filled again, while UML/ER markers (inheritance `block;endFill=0`,
  composition `diamond;endFill=1`) and `dependency` diamonds are untouched.
- `block`/`classic` heads remain available on explicit request.

### Default export: 300dpi PNG

- The default delivered image is now a **300dpi PNG** via draw.io Desktop instead of a
  standalone SVG. `cli.js` gains `--dpi` (default 300; scale = `dpi / 96` passed to Desktop for
  raster formats only), and `buildDrawioExportArgs` adds `-s <scale>` for PNG/JPG.
- When draw.io Desktop is unavailable, a requested PNG/PDF/JPG automatically falls back to a
  standalone SVG with a stderr warning (exit 0), preserving offline authoring.
- SVG, PDF, and JPG remain available on explicit request.

### Architecture design language (arch-dark)

- New built-in theme `assets/themes/arch-dark.json`: slate-950 background with
  role-coded semantic colors (cyan frontend, emerald backend, violet database,
  amber cloud, orange message bus, rose security accents), adapted from
  architecture-diagram-generator v1.1 (MIT, Cocoon AI); attribution in
  `assets/licenses/architecture-diagram-generator-MIT.txt`.
- New reference `references/docs/architecture-diagrams.md`: role-to-type
  mapping, two-line component labeling, dashed amber region / rose security
  group boundary conventions via module style overrides, message-bus gap
  placement, legend-outside-boundaries rule, and module headroom guidance.
- New `architecture` task route in SKILL.md wiring the design language into
  the create flow; frontmatter description unchanged.
- Three ported examples: `arch-dark-web-app.yaml`,
  `arch-dark-aws-serverless.yaml`, `arch-dark-microservices.yaml`, all clean
  under `--validate` (0 node crossings).

## 2.5.0 (2026-07-07)

Replication-quality round driven by an original-vs-replica comparison (industrial
architecture figure): straight native connectors, transparent text, faithful
vertical CJK labels.

### Straight orthogonal routing

- `buildRoutedEdges` resolves a shared absolute coordinate per edge (narrower-face
  center clamped into the faces' overlap interval) and derives exit/entry fractions
  from it, so no-waypoint orthogonal edges render as single straight segments by
  construction; same-face edges spread ≥30px with both endpoints moving together,
  and bidirectional pairs become two parallel straight lines.
- Face detection prefers the axis with a positive face-to-face gap, fixing wide-bar
  vs narrow-box pairs that previously routed through shape bodies.
- Legacy `0.25/0.5/0.75` slots remain only as the no-overlap fallback and now dodge
  coordinates already occupied on the same face (best-effort max-distance when the
  face is too small).
- New straightness audit in `validateEdgeQuality`: warns when an avoidable bend
  exists (collinear solution available but unused); `--strict` fails.

### Transparent text and label fidelity

- Plain `type: text` nodes always emit `fillColor=none;strokeColor=none;labelBackgroundColor=none`;
  explicit fills are ignored and reported by the new `validateTextNodeStyles`
  (which also warns when declared bounds are smaller than the content estimate).
  `overflow=hidden` removed from text nodes (no more clipped labels).
- Label newlines become `<br>` in emitted XML (XML attribute normalization used to
  fold them into spaces — the root cause of scrambled vertical CJK labels); math
  labels keep raw newlines. Vertical CJK label pattern (one char per line) documented.
- Content-aware default `labelOffset` (8px clearance + half label extent, axis
  flipped on bent/star/mesh edges) and a new `validateLabelCollisions` lint for
  labels on their own connector, across other connectors, and label/label overlap.
- `validateColorScheme` accepts `none`/`transparent` as explicit transparency.

### Native connectors and arrowheads

- Block/classic arrows default to a bold solid head (`endSize=12`, `startSize=12`
  with a start arrow), overridable per edge or theme.
- `validateXml` now returns `warnings` (additive) and reports floating edges
  (missing `source`/`target`), arrow shapes posing as connectors
  (`singleArrow`/`doubleArrow`/`triangle`/`mxgraph.arrows2.*`), and white-filled
  plain text cells; the CLI prints them and `--strict` fails on them.

### Assets and docs

- New regression fixture `evals/fixtures/industrial-architecture.yaml` (18-edge
  replica of the audited figure; baseline had 13 bent edges, now 0).
- `edge-quality-rules.md` (collinear-first, native-bound-edges, transparent-text
  blocking rules; counterpart-projection face policy), `tokens.md` (enforced
  transparency, vertical CJK pattern), `replicate.md` (mandatory transparency,
  content-aware offsets, new validate checklist), `SKILL.md` rules 13-14.
- Known follow-up: `aws-vpc-topology`, `campus-lan-topology`, `e-commerce`, and
  `vendor-device-mapping` examples still carry advisory label-collision warnings
  from dense layouts; they need layout spacing, not just offsets.

## 2.4.0 (2026-07-07)

Quality round driven by the 2026-07-06 audit (19 findings): academic figures and
network topologies now render faithfully offline, without hand-written bounds.

### SVG renderer fidelity (P0)

- Absolute geometry for module children (parent-relative coordinates resolved
  through the cell hierarchy); edges anchor on node boundaries instead of raw
  centers, honoring exit/entry anchors and `<Array as="points">` waypoints.
- Orthogonal bend synthesis for anchored edges, multi-line labels (`\n`,
  `<br>`, `&#10;`) as tspans, mxgraph cube rendering, 2-decimal coordinate output.

### Theme and style fidelity

- New vendored shape catalog (`assets/catalog/shape-catalog.json.gz`, 1.8k names)
  with `validateShapeReferences`: unknown stencil names now warn instead of
  rendering empty boxes; fake names corrected (cisco firewall/access point,
  `aws.ec2_instance` → `aws.ec2`, `aws.api-gateway` → `aws.api_gateway` alias).
- aws4 resource icons emit the compound `shape=mxgraph.aws4.resourceIcon;resIcon=…`
  style; theme `rounded`/typography tokens actually reach node styles; falsy
  style values (`strokeWidth: 0`, `rounded: false`) no longer swallowed by `||`.

### Validators (academic consistency)

- Density verdicts unified under `checkComplexity` (41/61/100 tiers); the
  contradictory 18/12 academic density warning is gone.
- Verbose-label rule measures visible length (TeX commands ≈ 1 glyph) and
  exempts `type: text` legends; long-label infos aggregate into one line.
- New `validateSchemaDrift`: unknown `meta` keys, `node.style` keys, and module
  keys (e.g. `canvasSize`, `style.shape`, module `bounds`) warn instead of being
  silently ignored. New oversized-canvas warning (>1500px with sub-8pt effective
  labels at IEEE single-column 252pt).

### Auto-layout engine

- Vendored `elkjs@0.11.1` (EPL-2.0, offline, no npm dependency): `layout:
hierarchical` specs without explicit geometry get an edge-aware layered
  layout — modules as compound containers, orthogonal edge routes played back
  as draw.io waypoints. Legacy grid remains as fallback (engine unavailable,
  mixed manual geometry, direct sync API use).
- Single-edge faces connect at the `0.5` center (was the off-center `0.25`
  slot); multi-edge faces keep the 0.25/0.5/0.75 distribution.
- New `layout: tiered`: North-South network rows from `network.tier`/`role`
  or semantic type (external on top, endpoints at the bottom).
- New `computeLayoutQualityMetrics` (node crossings / edge crossings / total
  edge length) reported by `--validate`. All 13 bundled examples pass
  `--validate` with zero warnings.
