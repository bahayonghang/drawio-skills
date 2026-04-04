# Stencil Library Guide

Use semantic shapes by default. Switch to provider or device stencils only when the diagram needs vendor-specific meaning or standardized equipment symbols.

## Decide Whether Shape Search Is Needed

Treat `search_shape_catalog` as an optional enhancement, not a requirement.

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

If `search_shape_catalog` is unavailable, fall back to:

1. known icon mappings in the design system
2. semantic shapes when exact icon resolution cannot be guaranteed

Do not fail the task just because shape search is missing.

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

## Recommended Usage

- Cloud reference architecture: provider icons for gateways, queues, storage, compute
- Network topology: routers, switches, firewalls, APs when exact device semantics matter
- Academic or conceptual system figure: semantic shapes first, provider icons only for external deployment targets

## Related

- [Live Backend Reference](mcp-tools.md)
- [Official XML Reference Mirror](../official/xml-reference.md)
- [Design System Icons](design-system/icons.md)
