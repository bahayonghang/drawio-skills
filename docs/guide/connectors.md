# Connectors And Edge Quality

Typed connectors express meaning and let themes change appearance without changing the diagram model.

## Connector Types

| Type | Meaning |
|---|---|
| `primary` | main request or process flow |
| `data` | data or secondary asynchronous flow |
| `optional` | optional, authentication, or weak relation |
| `dependency` | infrastructure or UML dependency |
| `bidirectional` | mutual relationship |
| `control` | agent or system control signal |
| `memory_read` | read from memory or storage |
| `memory_write` | write to memory or storage |
| `async` | non-blocking work |
| `feedback` | iterative return or reasoning loop |

```yaml
edges:
  - from: agent
    to: tool
    type: control
    label: invoke
  - from: tool
    to: agent
    type: feedback
    label: result
```

## Required Geometry Rules

- Bind every connector to source and target node ids.
- Prefer a straight collinear path when source and target faces overlap.
- Distribute multiple edges on a shared face; do not force arrows through corners.
- Keep parallel corridors and target-entry segments at least 30 layout units apart or long.
- Use explicit waypoints only when a bend is necessary; do not mix waypoints with manual exit/entry hints.
- Offset labels by half their visible extent plus clearance instead of hiding the line with a background.

The default flow arrowhead is open and uses `endSize=12`. Filled block/classic heads and UML/ER markers remain explicit semantic choices.

## Validation

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --strict
```

Use strict validation for publication figures, dense routing, and reusable reference assets. Resolve node crossings, avoidable bends, floating edges, arrow-shape stand-ins, label collisions, duplicate waypoints, and clipped text before delivery.

## Related

- [Architecture Diagrams](./architecture-diagrams.md)
- [Agent and Memory Diagrams](./agent-diagrams.md)
- [Export and Artifacts](./export.md)
