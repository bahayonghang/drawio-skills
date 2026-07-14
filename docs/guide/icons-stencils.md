# Icons And Stencil Search

Use semantic shapes by default. Use provider or device stencils only when vendor identity or standardized equipment symbols improve the diagram.

## Search Before Writing

The bundled catalog is offline and does not require MCP or network access.

```bash
node skills/drawio/scripts/cli.js search pod --prefix kubernetes
node skills/drawio/scripts/cli.js search "s3, lambda, nat gateway"
node skills/drawio/scripts/cli.js search virtual-machine --prefix mscae --limit 5
node skills/drawio/scripts/cli.js search firewall --json
```

Results include the real Draw.io name and, when available, the correct YAML alias such as `k8s.pod`.

| Option | Purpose |
|---|---|
| `--prefix <library>` | restrict results to one library |
| `--limit <n>` | cap the number of results |
| `--json` | emit machine-readable results |

## Bundled Coverage

| Library | Coverage |
|---|---|
| `aws4` | 599 flat stencils and 132 product-icon parameters |
| `gcp2` | 110 upstream stencils |
| `azure` | 87 upstream stencils |
| `mscae` | 148 Azure supplemental stencils |
| `kubernetes` | 39 `icon2` parameters, including `k8s.pod` |
| `cisco` / `cisco19` | 291 flat stencils and 149 parameterized entries |
| `networks` | 58 network stencils |

Other raw `mxgraph.*` libraries remain pass-through and are not claimed as catalog-covered.

## Choose The Right Shape Source

Skip search for ordinary flowcharts, UML, ER, org charts, mind maps, timelines, and academic figures built from basic geometry.

Search for cloud architecture, Kubernetes, Cisco or rack topology, vendor-heavy platforms, electrical/circuit work, and any diagram where exact symbol identity matters.

Fallback order when a requested library is not covered:

1. known provider mappings such as `aws.*`, `azure.*`, `gcp.*`, or `k8s.*`
2. bundled `lobe.*` or `ai.*` AI-provider icons
3. supported `brand.*` product logos
4. curated `lucide.*` semantic icons
5. semantic shapes

Do not invent a raw stencil name. Unknown names in covered libraries fail conversion with suggestions. Correct the name or search again; use `--allow-unknown-shapes` only as a temporary compatibility escape hatch for a known legacy stencil.

## Related

- [Architecture Diagrams](./architecture-diagrams.md)
- [CLI Reference](./cli.md)
- [Design System](./design-system.md)
