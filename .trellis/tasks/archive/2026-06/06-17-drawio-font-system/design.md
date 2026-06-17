# drawio skills font system - design

## Overview

This task adds a diagram-level Font Policy to the Draw.io Base Skill so users can force font-family selection across all v1 Text Surfaces. The canonical configuration surface is `meta.font`. When `meta.font` is present, it activates Forced Font Setting mode automatically and becomes the top-priority source for font-family resolution.

The scope is intentionally narrow:

- add diagram-level font-family control
- keep automatic content-based script allocation
- cover the four v1 Text Surfaces
- preserve existing size/color/weight behavior unless font-family selection already passes through the touched code path

It does not redesign typography tokens, style presets, or non-family text styling.

## Boundaries

### Base vs overlay

The Draw.io Base Skill owns:

- schema contract for `meta.font`
- font-family resolution helpers
- renderer changes for node text, formula nodes, module titles, and edge labels
- default fallback behavior for generic diagrams

The Academic Overlay owns:

- academic-facing guidance and examples
- academic/thesis default selection policy when no explicit `meta.font` is provided
- documentation that explains when academic users should rely on defaults versus forcing fonts explicitly

This keeps the overlay thin and avoids copying renderer or schema behavior into `skills/drawio-academic-skills`.

## Contract

### Canonical configuration surface

`meta.font` is the only new diagram-level contract.

Planned minimum shape:

```yaml
meta:
  font:
    primary: "Times New Roman"
    cjk: "Simsun"
    formula: "Times New Roman"
```

The fields are font-family strings, not nested objects.

### Semantics

- `meta.font` absent: use the deterministic fallback policy.
- `meta.font` present: enable force mode automatically.
- In force mode, font-family resolution ignores lower-priority family sources for all covered Text Surfaces.
- Mixed-script routing still happens inside force mode:
  - formula-bearing text -> `formula`
  - CJK-bearing text -> `cjk`
  - all other text -> `primary`

### Precedence

Runtime font-family precedence:

1. `meta.font` routed by content category, when present
2. existing local `style.fontFamily` on node-like surfaces
3. deterministic fallback policy

Important compatibility note:

- v1 changes precedence only for font-family, not for font size, color, bold, italic, or alignment.
- In force mode, even explicit node `style.fontFamily` is intentionally overridden. That is a product decision, not an incidental side effect.

## Content routing

### Routing categories

The system should resolve each visible string into one of three family buckets:

- `primary`
- `cjk`
- `formula`

### Detection strategy

Use the simplest deterministic routing that matches current product intent:

- formula nodes always use `formula`
- math-prepared edge labels or text that the renderer already treats as formula should use `formula`
- text containing CJK characters should use `cjk`
- everything else should use `primary`

The goal is not perfect linguistic segmentation. The goal is deterministic, content-aware family selection with low implementation risk.

### Mixed-script behavior

For v1, routing is per Text Surface, not per substring. A label containing any CJK characters should use the `cjk` family for that surface unless it is classified as formula content first.

This keeps implementation simple and matches the user's "automatic allocation" requirement without introducing inline rich-text font runs.

## Text Surfaces

### Node text

Already has a font-family resolution path. This path needs to accept the new diagram-level force rule.

### Formula nodes

Already travel through semantic formula detection and existing formula-family theme fallbacks. This path should route to `meta.font.formula` in force mode.

### Module titles

Currently use module label size/color/weight settings but do not appear to use the same shared font-family resolver. V1 needs a shared font-family decision here.

### Edge labels

Currently emit font size and font color but no font family. V1 must add font-family emission and route it through the same diagram-level policy.

## Fallback policy

### Explicit force mode

When `meta.font` exists, the fallback question disappears because all covered surfaces resolve through the provided contract.

### No explicit force mode

When `meta.font` is absent:

- generic English diagrams should default to `Times New Roman`
- academic Chinese thesis diagrams should default to `Times New Roman, Simsun` through automatic content routing
- the `Simsun` fallback remains academic-only; generic diagrams that happen to contain Chinese text do not automatically inherit the academic thesis fallback path
- the renderer does not consult theme typography as a font-family fallback in v1

## Compatibility and migration

- Existing specs without `meta.font` remain valid.
- Existing node `style.fontFamily` keeps working unless the user opts into `meta.font`.
- Existing themes continue to supply typography defaults, but some academic theme defaults may later be adjusted to align better with the new fallback policy.
- Style preset schema does not need a breaking redesign for v1 because `meta.font` sits above presets.

## Touched areas

Expected implementation impact:

- `skills/drawio/assets/schemas/spec.schema.json`
- `skills/drawio/scripts/dsl/spec-to-drawio.js`
- font-related tests in `skills/drawio/scripts/dsl/spec-to-drawio.test.js`
- docs for specification and themes if implementation proceeds

## Trade-offs

### Why no extra mode switch

Adding `meta.font.mode` or `enabled` would create a second branch for no confirmed product gain. Presence-based activation is the smallest coherent contract.

### Why per-surface instead of per-substring routing

Inline mixed-font rendering would require HTML/rich-text level handling and would increase renderer complexity across draw.io XML and SVG export paths. Per-surface routing is enough for the current requirement.

### Why family-only scope

The request is about font-family determinism and forced font control. Pulling size/color/weight into the same feature would broaden blast radius and mix separate typography concerns.
