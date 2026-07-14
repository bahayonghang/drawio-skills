# Architecture Diagrams

Use the base skill for software architecture, cloud systems, microservice maps, and deployment views. Use the Academic Overlay when the same figure is intended for publication.

## Choose A Visual Register

- `tech-blue`: general light-background engineering documentation
- `arch-dark`: role-coded dark architecture and cloud diagrams
- `blueprint`: formal architecture, UML, and network topology
- `academic` or `academic-color`: publication figures through the overlay

```yaml
meta:
  title: Order Platform Architecture
  theme: arch-dark
  layout: horizontal
```

## Map Roles To Semantic Types

| Role | Node type |
|---|---|
| client or frontend | `user` |
| backend API or worker | `service` or `process` |
| database or persistent store | `database` |
| managed cloud service | `cloud` |
| event bus or queue | `queue` |
| third-party system | `terminal` or `document` |

Let the theme own role colors. Use explicit fills only when the source or product identity requires them.

## Boundaries And Labels

Represent regions, accounts, networks, and security groups as transparent `modules`. Keep their labels above member nodes and leave enough headroom for the boundary title.

Use concise two-line component labels when the technology matters:

```yaml
nodes:
  - id: api
    label: "API Server\nFastAPI :8000"
    type: service
    module: app
```

## Connector Semantics

| Meaning | Edge type |
|---|---|
| primary request path | `primary` |
| data or asynchronous flow | `data` |
| authentication or optional relation | `optional` |
| infrastructure dependency | `dependency` |

Bind every connector to source and target node ids. Label protocols and ports on the edge, and run validation to catch crossings, overlaps, and label-clearance problems.

## Architecture Checklist

1. Search the bundled stencil catalog before using provider-specific icons.
2. Keep provider icons limited to components whose identity matters.
3. Place message-bus nodes between producer and consumer rows.
4. Keep legends outside all module boundaries.
5. Prefer automatic layout before adding manual positions.
6. Validate and inspect the exported image before delivery.

## Related

- [Icons and Stencil Search](./icons-stencils.md)
- [Themes and Style Presets](./themes-presets.md)
- [Connectors and Edge Quality](./connectors.md)
- [Architecture Example](/examples/architecture.md)
