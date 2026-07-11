# Draw.io Skill: Semantic Type Extension Guide

> Recorded from task 07-11-fireworks-into-drawio (2026-07-11).

## Adding a new node/edge semantic type

Touchpoints (all required, in order):

1. `skills/drawio/assets/schemas/spec.schema.json` — add to the node `type` or edge `type` enum.
2. `skills/drawio/scripts/dsl/spec-to-drawio.js` — add entries to BOTH:
   - the built-in default theme block (node fill/stroke or connector stroke/dash/arrow), and
   - `SHAPE_STYLES` (node types only; reuse existing mxGraph primitives — `rounded`, `hexagon`, `cylinder3`, `dashed=1` — never new drawing code paths).
3. **Every** theme JSON under `skills/drawio/assets/themes/` — add the matching `node.<type>` / `connector.<type>` entry.

## Pitfall: silent theme fallback

A theme JSON that omits a connector/node type does not error — the renderer
silently falls back (edges render as `primary`), so semantic colors/dashes
vanish under that theme with zero warnings. This bit us when agentic connector
types were only added to arch-dark/academic: the other 5 themes rendered them
indistinguishable from primary edges.

**Rule**: when adding a semantic type, grep every file in `assets/themes/` for
the new key and confirm coverage:

```bash
for t in skills/drawio/assets/themes/*.json; do echo -n "$t: "; grep -c '"<new_type>"' "$t"; done
```

## Verification recipe

- Smoke YAML in `.drawio-tmp/` (never in `references/examples/`) containing every new type; render with `--validate` per theme.
- Edge YAML fields are `from`/`to` (not source/target).
- Full regression: every `references/examples/*.yaml` must still pass `--validate`.

## Semantics conventions

- Theme tokens override type-default colors; monochrome themes (academic,
  high-contrast) must distinguish edge semantics by dash pattern, never color
  alone.
- ≥2 edge semantic types in one diagram ⇒ `meta.legend` required (compact
  single text node). See `skills/drawio/references/docs/design-system/connectors.md`.
