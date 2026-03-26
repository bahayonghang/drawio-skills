# Specification Format

The YAML specification is the canonical representation for Draw.io Skill 2.2.0.

Mermaid, CSV, and imported `.drawio` files are convenience inputs. They should all normalize into this structure before rendering.

## Minimal Example

```yaml
meta:
  theme: tech-blue
  layout: horizontal

nodes:
  - id: api
    label: API Gateway
    type: service
  - id: db
    label: PostgreSQL
    type: database

edges:
  - from: api
    to: db
    type: data
    label: Query
```

## Top-Level Sections

### `meta`

Diagram-wide settings.

```yaml
meta:
  theme: tech-blue
  layout: horizontal
  routing: orthogonal
  profile: default
  title: Example Diagram
  source: authored
```

Common fields:

- `theme`: `tech-blue`, `academic`, `academic-color`, `nature`, `dark`, `high-contrast`
- `layout`: `horizontal`, `vertical`, `hierarchical`
- `routing`: `orthogonal`, `rounded`
- `profile`: `default`, `academic-paper`, `engineering-review`
- `source`: `authored` or `replicated`

### `modules`

Logical containers for related nodes.

```yaml
modules:
  - id: backend
    label: Backend
```

### `nodes`

Required. Each node needs a stable `id` and `label`.

```yaml
nodes:
  - id: api
    label: API Gateway
    type: service
    module: backend
    position:
      x: 160
      y: 96
    icon: aws.api-gateway
```

### `edges`

Optional, but most diagrams use them.

```yaml
edges:
  - from: api
    to: db
    type: data
    label: Query
    labelPosition: center
```

## Replication Metadata

Replicated diagrams usually include:

```yaml
meta:
  source: replicated
  replication:
    colorMode: preserve-original
    background: "#FFF7ED"
    palette:
      - hex: "#FDBA74"
        role: service fill
        appliesTo: nodes
        confidence: high
```

`colorMode` can be:

- `preserve-original`
- `theme-first`

## Type Auto-Detection

When `type` is omitted, labels can still map to:

- `database`
- `decision`
- `terminal`
- `queue`
- `user`
- `document`
- `formula`
- default fallback: `service`

Formula detection should only rely on:

- `$$...$$`
- `\(...\)`
- `` `...` ``

## Validation Expectations

The compiler validates:

- schema and ID correctness
- theme, profile, and layout values
- layout consistency
- edge quality
- academic-paper requirements when enabled

Use strict mode when warnings should fail the build.

## Migration from A-H Format

The old A-H format is legacy guidance. The canonical mapping is now:

| Legacy idea | YAML location |
|-------------|---------------|
| layout | `meta.layout` |
| modules | `modules[]` |
| nodes | `nodes[]` |
| edges | `edges[]` |
| visual style | `meta.theme` and `style` overrides |
| export intent | local CLI or Desktop export path |

## Related

- [Design System](./design-system.md)
- [CLI Tool](./cli.md)
- [Replicating Diagrams](./scientific-workflows.md)
