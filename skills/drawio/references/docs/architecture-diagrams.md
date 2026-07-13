# Architecture Diagram Design Language

Semantic color coding, boundary conventions, spacing discipline, and legend
rules for system/software architecture diagrams rendered with the `arch-dark`
theme.

> **Attribution**: This design language is adapted from
> [architecture-diagram-generator](https://github.com/Cocoon-AI/architecture-diagram-generator)
> v1.1 (MIT License, Cocoon AI). See
> `assets/licenses/architecture-diagram-generator-MIT.txt`. The original skill
> emits HTML+SVG pages; this adaptation maps its palette and layout rules onto
> the YAML-first `.drawio` pipeline.

## When to use

Software/system architecture, microservice maps, and cloud service diagrams
that benefit from role-based color coding on a dark background. Not for
network topology (use `ieee-network-diagrams.md`), publication figures (use
the academic overlay), or light-background deliverables (use `tech-blue`).

Set the theme in the spec:

```yaml
meta:
  title: Order Platform Architecture
  theme: arch-dark
```

## Role-to-type mapping

Assign each component a role, then use the mapped node type. The `arch-dark`
theme colors follow automatically — do not hand-set fills for these roles.

| Role                  | Node type               | Fill      | Stroke    | Typical components                  |
| --------------------- | ----------------------- | --------- | --------- | ----------------------------------- |
| Frontend / client     | `user`                  | `#0E3A47` | `#22D3EE` | browsers, mobile apps, edge devices |
| Backend service       | `service` / `process`   | `#064E3B` | `#34D399` | APIs, workers, gateways             |
| Database / storage    | `database`              | `#3B2A63` | `#A78BFA` | SQL/NoSQL, object storage, caches   |
| Cloud managed service | `cloud`                 | `#4A3410` | `#FBBF24` | CDN, serverless, managed queues     |
| Message / event bus   | `queue`                 | `#4A2A12` | `#FB923C` | Kafka, RabbitMQ, event streams      |
| External / generic    | `terminal` / `document` | `#1E293B` | `#94A3B8` | third-party systems, users' systems |
| Security element      | module boundary         | `none`    | `#FB7185` | security groups, auth scopes        |

Security is expressed as a dashed boundary (see below) or, for concrete auth
components (identity provider), a `terminal` node connected with the rose
`optional` connector.

## Component labeling

Two-line labels: component name first, technology + port second:

```yaml
nodes:
  - id: api
    label: "API Server\nFastAPI :8000"
    type: service
    position: { x: 320, y: 100 }
```

Per-line font styling is not supported (HTML in labels is rejected by
validation); both lines render at the same size. Keep the second line short —
technology name and port only. Visual hierarchy comes from role colors, not
from label typography.

## Boundary conventions

Region/cloud boundaries and security groups are `modules` with style
overrides. Members reference the module by id.

```yaml
nodes:
  - id: api
    label: "API Server\nFastAPI :8000"
    type: service
    position: { x: 320, y: 100 }
    module: sg-api

modules:
  # Cloud region: large rounded, long amber dashes
  - id: region
    label: "AWS Region: us-west-2"
    style:
      fillColor: none
      strokeColor: "#FBBF24"
      dashed: true
      dashPattern: "8 4"

  # Security group: rose, short dashes
  - id: sg-api
    label: "sg-api :8000"
    style:
      fillColor: none
      strokeColor: "#FB7185"
      dashed: true
      dashPattern: "4 4"
```

Keep `fillColor: none` on boundaries so connectors and members stay readable.

## Connector semantics

| Flow                      | Edge `type`  | Rendering                         |
| ------------------------- | ------------ | --------------------------------- |
| Primary request path      | `primary`    | solid `#94A3B8`, open head        |
| Data/async flow           | `data`       | dashed `#64748B` (6 4)            |
| Auth / security flow      | `optional`   | dashed rose `#FB7185` (5 5), open |
| Infrastructure dependency | `dependency` | thin `#64748B`, diamond head      |

Label protocols and ports on edges (`label: HTTPS`, `label: "JWT"`). Keep
edges bound to node ids — never floating arrows (base rule 14).

## Spacing discipline

- Standard component footprint: about 120-160 wide, 60-64 tall. Let `size`
  defaults apply unless replicating.
- Module boundaries grow roughly 64 layout units above their topmost member's
  center (padding plus label headroom). Keep the topmost in-module node at
  `y >= 120` so the dashed boundary stays inside the canvas.
- Minimum gap between stacked components: 40 layout units. Place message-bus
  (`queue`) nodes **in the gap** between producer and consumer rows, never
  overlapping either row.
- Prefer auto layout (`layout: horizontal|vertical|hierarchical`) first; use
  explicit `position` only when boundaries or flow direction demand it.
- Run `--validate` and clear overlap and label-clearance warnings before
  delivery.

## Legend rules

Build legends from small nodes plus `text` labels, one entry per role used in
the diagram. Placement is strict:

- The legend sits **outside every module boundary**, below the lowest one,
  with at least 20 layout units of clearance.
- Never place a legend inside a region/cluster boundary.

```yaml
nodes:
  - id: legend-service
    label: Backend
    type: service
    position: { x: 100, y: 560 }
    size: small # size takes a preset name (small/medium/large/xl), not w/h
  - id: legend-db
    label: Database
    type: database
    position: { x: 220, y: 560 }
    size: small
```

## Post-generation self-check

Before reporting completion:

1. Role colors match the mapping table (no hand-set fills drifting from it).
2. Text readable on dark fills; no dark-on-dark labels.
3. `--validate` reports no overlap or label-clearance warnings.
4. Legend (if present) is below all module boundaries with clearance.
5. Message-bus nodes sit in gaps, not on top of service rows.
6. Exported SVG background is `#020617` (dark canvas is part of the design).
