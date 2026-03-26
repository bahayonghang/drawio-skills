# Design System

The Draw.io design system gives the skill a stable visual vocabulary across engineering, academic, and presentation diagrams.

## Core Concepts

### Profiles

| Profile | Purpose |
|---------|---------|
| `default` | Standard diagrams |
| `academic-paper` | IEEE, thesis, journal, and paper-ready figures |
| `engineering-review` | Dense architecture or network diagrams with stricter routing review |

### 6 Built-In Themes

| Theme | Best for |
|-------|----------|
| `tech-blue` | Software architecture, DevOps, general technical diagrams |
| `academic` | Grayscale-safe papers and IEEE figures |
| `academic-color` | Color paper figures and research presentations |
| `nature` | Lifecycle, biology, environment, sustainability |
| `dark` | Slides and presentation assets |
| `high-contrast` | Accessibility-first and maximum legibility |

### Semantic Node Types

| Type | Shape |
|------|-------|
| `service` | Rounded rectangle |
| `database` | Cylinder |
| `decision` | Diamond |
| `terminal` | Stadium |
| `queue` | Parallelogram |
| `user` | Ellipse |
| `document` | Document |
| `formula` | Rectangle tuned for math content |

### Typed Connectors

| Type | Purpose |
|------|---------|
| `primary` | Main flow |
| `data` | Data or async flow |
| `optional` | Weak relation |
| `dependency` | Dependency annotation |
| `bidirectional` | Mutual relationship |

### 8px Grid Defaults

- node spacing: `32px`
- module padding: `24px`
- canvas padding: `32px`

## Theme Switching

Change the theme in the spec and re-render. Token-based styles will follow the new theme automatically.

Explicit color overrides do **not** change when the theme changes.

## Replication Color Modes

| Mode | Meaning |
|------|---------|
| `preserve-original` | Keep extracted source colors as explicit overrides |
| `theme-first` | Normalize the redraw to the selected theme |

## Academic Notes

For `academic-paper` output:

- prefer `academic` unless the user explicitly wants color
- include `title` and, when needed, a `legend`
- avoid using color as the only semantic carrier

## Custom Themes

Custom themes are JSON files that extend the theme schema. At minimum, define:

- `name`
- `displayName`
- `colors`
- `spacing`
- `typography`
- `node`
- `connector`
- `module`
- `canvas`

See the reference docs under `skills/drawio/references/docs/design-system/`.

## Related

- [Specification Format](./specification.md)
- [Creating Diagrams](./creating-diagrams.md)
- [Replicating Diagrams](./scientific-workflows.md)
- [Math Typesetting](./math-typesetting.md)
