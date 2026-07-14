# Stencil Library Guide

Use semantic shapes by default. Switch to provider or device stencils only when the diagram needs vendor-specific meaning or standardized equipment symbols.

## Search Before Writing

For vendor stencils, use the bundled offline catalog before putting an icon in YAML. It requires no MCP server or network connection:

```bash
node scripts/cli.js search pod --prefix kubernetes
node scripts/cli.js search "s3, lambda, nat gateway"
node scripts/cli.js search virtual-machine --prefix mscae --limit 5
```

Results show the real draw.io name and, when available, the correct YAML syntax such as `k8s.pod`. `--prefix` filters a library, `--limit` controls the number of rows, and `--json` produces machine-readable output. Covered unknown names are rejected during conversion with suggestions. Correct the YAML or run the suggested search; use `--allow-unknown-shapes` only when preserving a known legacy raw stencil is more important than validation.

### Bundled coverage

| Library | Search and validation coverage |
| --- | --- |
| `aws4` | 599 flat stencils plus 132 product-icon parameters |
| `gcp2` | 110 upstream stencils |
| `azure` | 87 upstream stencils |
| `mscae` | 148 Azure supplemental stencils |
| `kubernetes` | 39 `icon2` parameters, including `k8s.pod` |
| `cisco` / `cisco19` | 291 flat Cisco stencils plus 149 `cisco19.rect` parameters |
| `networks` | 58 network stencils |

Other `mxgraph.*` libraries remain pass-through and are not rejected by this catalog.

## Decide Whether Exact Stencil Search Is Needed

### Skip shape search when the diagram is mostly basic geometry

- flowcharts
- UML diagrams
- ER diagrams
- org charts
- mind maps
- timelines
- wireframes
- academic figures that only need boxes, diamonds, cylinders, circles, and arrows

### Use shape search when exact stencil identity matters

- AWS / Azure / GCP architectures
- Cisco or rack-network topologies
- Kubernetes or vendor-heavy platform diagrams
- P&ID / electrical / circuit diagrams
- BPMN variants where exact task or event symbols matter

If the requested library is outside the bundled coverage, fall back to:

1. known icon mappings in the design system
2. bundled `lobe.*` or `ai.*` icons for OpenAI, Claude, and Gemini
3. `brand.*` icons for supported non-AI product logos such as Redis
4. `lucide.*` icons for generic semantic roles such as AI, cache, document,
   server, workflow, and security
5. semantic shapes when exact icon resolution cannot be guaranteed

Do not invent a raw name just because the requested library is not covered.

## Core Rules

1. Use semantic shapes when the audience cares more about function than branding.
2. Use stencils when vendor or device identity materially improves clarity.
3. Do not guess raw stencil names that are not documented or returned by search.
4. If mixed with semantic shapes, keep icon usage limited to nodes whose branded identity matters.
5. In academic figures, prefer monochrome-compatible icons or add a legend.

## Provider Prefixes

Common icon prefixes supported by the design system:

- `aws.*`
- `azure.*`
- `gcp.*`
- `k8s.*`
- `kubernetes.*`
- `lobe.*` / `ai.*` for the bundled OpenAI, Claude, and Gemini logos
- `brand.*` for supported non-cloud product identity icons
- `lucide.*` for the curated embedded semantic SVG icon set

Unsupported image-icon names fail shape validation. Add new names by bundling
their SVG data and license notice; do not add runtime CDN fallbacks.

## Recommended Usage

- Cloud reference architecture: provider icons for gateways, queues, storage, compute
- Network topology: routers, switches, firewalls, APs when exact device semantics matter
- Academic or conceptual system figure: semantic shapes first, provider icons only for external deployment targets

## Related

- [Live Backend Reference](mcp-tools.md)
- [Official XML Reference Mirror](../official/xml-reference.md)
- [Design System Icons](design-system/icons.md)
