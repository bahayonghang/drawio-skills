# Changelog — drawio base skill

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
