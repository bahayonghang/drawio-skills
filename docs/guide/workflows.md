# Workflows Overview

Draw.io Skill exposes three core routes:

- `/drawio create`
- `/drawio edit`
- `/drawio replicate`

All three routes share the same YAML-first model, design system, and validation stack.

## Shared Runtime Rules

1. **Offline-first** by default
2. **Desktop-enhanced** when draw.io Desktop is available
3. **Optional live MCP** only for real-time browser refinement

The skill keeps this editable bundle together whenever possible:

- `<name>.drawio`
- `<name>.spec.yaml`
- `<name>.arch.json`

## Route Comparison

| Route | Primary input | Default output | When to use |
|------|---------------|----------------|-------------|
| `create` | Text, YAML, Mermaid, CSV | New `.drawio` bundle | Build a new diagram |
| `edit` | Existing bundle or `.drawio` file | Updated bundle | Modify or restyle a diagram |
| `replicate` | Uploaded image or screenshot | Redrawn `.drawio` bundle | Recreate a reference diagram |

## `/drawio create`

Use this for brand-new diagrams.

### Input modes

- Natural language
- YAML spec
- Mermaid
- CSV hierarchy / org-chart style input

### Fast path

The skill can skip clarification when the request already makes the type, theme, layout, and complexity clear.

### Full path

The skill slows down and drafts the logic first when the request is:

- ambiguous
- dense
- academic
- stencil-heavy
- routing-sensitive

### Automatic branches

- **Academic**: enables paper-quality validation and academic defaults
- **Math / Formula**: enforces official delimiters only
- **Stencil-heavy**: loads cloud and network icon guidance

See [Creating Diagrams](./creating-diagrams.md).

## `/drawio edit`

Use this for incremental changes, imports, restructures, or theme switches.

### Preferred edit targets

1. Existing offline bundle
2. Existing `.drawio` imported into a bundle
3. Live browser session only when explicitly requested

### Common edit types

- rename labels
- add or remove nodes and edges
- switch themes
- change semantic types
- restructure modules
- move elements with grid-safe positions

See [Editing Diagrams](./editing-diagrams.md).

## `/drawio replicate`

Use this to redraw an uploaded image into a structured spec.

### Core replication steps

1. Analyze the diagram structure
2. Extract the source palette
3. Build a YAML spec
4. Present logic and palette summary when needed
5. Render the offline bundle

### Color modes

| Mode | Default | Effect |
|------|---------|--------|
| `preserve-original` | Yes | Preserve source palette with explicit style overrides |
| `theme-first` | No | Normalize the redraw to the selected theme |

See [Replicating Diagrams](./scientific-workflows.md).

## Shared Guardrails

### Design system

- 6 built-in themes
- semantic node types
- typed connectors
- 8px grid defaults

### Validation

- structure validation
- layout validation
- quality validation

### Strict mode

Use `--strict` or `--strict-warnings` when publication quality or release-grade review matters.

## Next Steps

- [Creating Diagrams](./creating-diagrams.md)
- [Editing Diagrams](./editing-diagrams.md)
- [Replicating Diagrams](./scientific-workflows.md)
- [Design System](./design-system.md)
- [Specification Format](./specification.md)
