# Draw.io XML Format Notes

This file is the **local supplement** to the official draw.io XML reference. For the complete upstream rules on styles, containers, layers, tags, metadata, dark mode, and XML well-formedness, read:

- [Official XML Reference Mirror](../official/xml-reference.md)
- [Official Style Reference Mirror](../official/style-reference.md)

This document only covers drawio-skill-specific guidance that does not belong in the upstream mirror.

## What this skill adds on top of the official XML rules

### Offline-first bundle contract

The skill does not treat XML as the canonical authoring format. XML is the render target for:

- YAML spec
- imported `.drawio`
- normalized Mermaid / CSV input

When work is expected to continue later, keep the canonical trio together:

- `<name>.drawio`
- `<name>.spec.yaml`
- `<name>.arch.json`

### Standalone SVG limitation

Standalone SVG export without draw.io Desktop is preview-quality only:

- node geometry is preserved
- edges are rendered as straight lines between node centers
- publication-grade orthogonal routing still requires draw.io Desktop export or manual refinement in draw.io

### Formula rules

When labels include math:

- use `$$...$$` for standalone formulas
- use `\\(...\\)` for inline formulas
- use `` `...` `` for AsciiMath only when explicitly preferred or very simple
- do **not** emit `$...$`, `\\[...\\]`, or bare LaTeX commands

### Runtime order

Prefer this backend order:

1. offline bundle generation
2. draw.io Desktop export when available
3. optional live backend only when browser or inline refinement is genuinely needed

### Live edit fallback

If a live backend does not support both `read_diagram_xml` and `patch_diagram_cells`, do not attempt incremental live editing. Import to YAML sidecars first, then regenerate.
