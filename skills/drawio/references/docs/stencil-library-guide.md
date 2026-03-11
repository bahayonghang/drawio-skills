# Stencil Library Guide

Use semantic shapes by default. Switch to provider or device stencils only when the diagram needs vendor-specific meaning.

## Choose Semantic Shapes First

Use semantic shapes when:

- The diagram is conceptual or paper-facing.
- The audience cares more about function than vendor branding.
- You need strong theme consistency across the whole figure.

Use stencils when:

- The request explicitly mentions AWS, Azure, GCP, Cisco, Kubernetes, or other vendor/device families.
- The diagram is an engineering architecture or infrastructure reference.
- A provider icon materially improves clarity.

## Provider Prefixes

Common icon prefixes supported by the design system:

- `aws.*`
- `azure.*`
- `gcp.*`
- `k8s.*` or `kubernetes.*` if a matching stencil exists in the target environment

## Rules

1. Do not guess stencil names.
2. Keep label placement consistent and readable.
3. Use theme-compatible fill/stroke values when the stencil requires explicit colors.
4. If mixed with semantic shapes, keep icon usage limited to nodes whose vendor identity matters.
5. In academic figures, prefer monochrome-compatible icons or add a legend.

## Recommended Usage

- Cloud reference architecture: provider icons for gateways, queues, storage, compute.
- Network topology: device stencils for routers, switches, firewalls, APs.
- Academic/system paper figure: semantic shapes first; vendor icons only for external systems or deployment targets.
