# Design System

The design system turns semantic YAML into consistent nodes, modules, typography, connectors, and canvas styling. Use semantic types and themes first; use raw Draw.io styles only for small XML exceptions.

## Authoring Layers

1. **Profile** sets workflow policy: `default`, `academic-paper`, or `engineering-review`.
2. **Theme** sets visual tokens for canvas, type, nodes, modules, and connectors.
3. **Semantic types** express roles such as service, database, Agent, memory, or tool.
4. **Typed connectors** express primary, data, dependency, control, memory, and feedback flows.
5. **Explicit overrides** preserve source-specific details when replication or branding requires them.

## Bundled Themes

| Theme | Primary use |
|---|---|
| `tech-blue` | general technical diagrams |
| `notion-clean` | minimal documentation and structured tables |
| `blueprint` | formal architecture, UML, and networks |
| `arch-dark` | role-coded cloud and service architecture |
| `dark-terminal` | developer and Agent systems |
| `dark-luxury` | editorial or keynote diagrams |
| `nature` | lifecycle and organic topics |
| `dark` | general presentation work |
| `high-contrast` | accessibility and maximum legibility |
| `academic` | grayscale-safe publication figures |
| `academic-color` | color publication figures |

See [Themes and Style Presets](./themes-presets.md) before selecting or customizing a theme.

## Semantic Node Types

Core types include `service`, `process`, `database`, `decision`, `terminal`, `queue`, `user`, `document`, `cloud`, `formula`, and transparent `text`.

Agentic diagrams add `llm`, `agent`, `vector_store`, `memory`, `tool`, and `gateway`. Provider-specific identity is expressed through validated icons or stencils, not invented shape names.

## Modules And Layout

Use `modules` for regions, layers, networks, swimlanes, accounts, and security boundaries. Prefer `horizontal`, `vertical`, `hierarchical`, `tiered`, or `star` layout before adding explicit positions. Use explicit `bounds` when replicating a source or preserving text placement.

The base grid uses 8-unit increments, with typical node gaps around 32 and module padding around 24. Treat those as defaults rather than reasons to force every diagram into one density.

## Typed Connectors

General flow types are `primary`, `data`, `optional`, `dependency`, and `bidirectional`. Agent and memory systems add `control`, `memory_read`, `memory_write`, `async`, and `feedback`.

Every connector must bind to node ids. See [Connectors and Edge Quality](./connectors.md) for routing and validation rules.

## Text, Math, And Replication

- `text` nodes are transparent and content-sized.
- `formula` nodes and labels use supported MathJax or AsciiMath delimiters.
- replication uses `bounds`, `labelOffset`, alignment, and spacing to preserve visible text geometry.
- explicit source colors remain explicit under later theme switches.

## Task-Specific Guides

- [Architecture Diagrams](./architecture-diagrams.md)
- [Agent and Memory Diagrams](./agent-diagrams.md)
- [Icons and Stencil Search](./icons-stencils.md)
- [Math Typesetting](./math-typesetting.md)
- [Academic Overlay](./academic-overlay.md)

## Custom Themes And Presets

Custom themes are schema-validated JSON token sets. User style presets should be copied from bundled presets before modification. Do not mutate bundled base presets or duplicate themes into the Academic Overlay.

## Related

- [Specification](./specification.md)
- [Creating Diagrams](./creating-diagrams.md)
- [Replicating Diagrams](./scientific-workflows.md)
