# Workflows Overview

Draw.io Skill exposes three base routes and an academic overlay policy:

- `/drawio create`
- `/drawio edit`
- `/drawio replicate`
- `/drawio-academic-skills` for publication-facing variants of those routes

All routes share the same YAML-first model, design system, base CLI, and validation stack.

## Shared Runtime Rules

1. **Offline Authoring Path** by default
2. **Desktop-Enhanced Export** when draw.io Desktop is available
3. **Live Refinement Backend** only for explicit base-skill browser refinement
4. **Direct XML Exception** only for tiny XML-only handoff or exact mxGraph control

The skill keeps final delivery directories focused on:

- `<name>.drawio`

Canonical sidecars such as `<name>.spec.yaml` and `<name>.arch.json` should live in a project-local work directory such as `.drawio-tmp/<name>/` unless the user explicitly asks for a beside-output bundle. Academic overlay adds `<name>.svg` to the default publication final delivery set.

## Route Comparison

| Route | Primary input | Default output | When to use |
| --- | --- | --- | --- |
| `create` | Text, YAML, Mermaid, CSV | New `.drawio` plus work-dir sidecars | Build a new general diagram |
| `edit` | Existing bundle or `.drawio` file | Updated `.drawio` plus work-dir sidecars | Modify or restyle a diagram |
| `replicate` | Uploaded image or screenshot | Redrawn `.drawio` plus work-dir sidecars | Recreate a reference diagram |
| `academic overlay` | Paper/thesis/manuscript prompt | final `.drawio + .svg`, sidecars in work dir | Publication-ready figures |

## `/drawio create`

Use this for brand-new general diagrams.

### Input modes

- Natural language
- YAML spec
- Mermaid
- CSV hierarchy / org-chart style input
- Existing `.drawio` import when paired with `--input-format drawio`

### Fast path

The skill can skip clarification when the request already makes the type, theme, layout, and complexity clear.

### Full path

The skill slows down and drafts the logic first when the request is:

- ambiguous
- dense
- stencil-heavy
- routing-sensitive
- a replication or major edit

### Automatic branches

- **Math / Formula**: enforces official delimiters only
- **Stencil-heavy**: loads cloud and network icon guidance
- **Edge audit**: loads routing and label-clearance rules
- **Academic trigger**: use the sibling academic overlay when publication policy matters

See [Creating Diagrams](./creating-diagrams.md).

## Academic Overlay

Use `drawio-academic-skills` for paper, thesis, IEEE, journal, manuscript, publication-ready, A4/Word/LaTeX, or formula-heavy scholarly figures.

The overlay performs academic preflight:

- venue or audience
- `figureType`: `architecture`, `roadmap`, or `workflow`
- monochrome vs color policy
- caption, title, and legend needs
- formula and text-position fidelity
- requested exports and Desktop availability

It then executes through sibling `../drawio/scripts/cli.js`. It does not use MCP/live backend.

## `/drawio edit`

Use this for incremental changes, imports, restructures, or theme switches.

### Preferred edit targets

1. Existing offline bundle
2. Existing `.drawio` imported into a bundle
3. Live browser session only when explicitly requested for base-skill refinement

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
3. Run a text-fidelity pass for labels, captions, formulas, and edge labels
4. Build a YAML spec
5. Present logic, palette, and text-placement summary when needed
6. Render final artifacts and work-dir sidecars

### Text fidelity

Replication should preserve more than structure and color:

- keep standalone text, captions, legends, and formula annotations as first-class elements when their position matters;
- prefer explicit `bounds` for exact text boxes and formulas;
- use `labelOffset` to keep connector labels off the line instead of sitting on top of it;
- compare the source and export once for title, caption, callout, formula, and edge-label placement.

### Color modes

| Mode | Default | Effect |
| --- | --- | --- |
| `preserve-original` | Yes | Preserve source palette with explicit style overrides |
| `theme-first` | No | Normalize the redraw to the selected theme |

See [Replicating Diagrams](./scientific-workflows.md).

## Shared Guardrails

### Design system

- 6 built-in themes
- shared style presets in `skills/drawio/styles/built-in/`
- semantic node types
- typed connectors
- 8px grid defaults

### Validation

- structure validation
- layout validation
- quality validation
- formula delimiter validation
- text-position validation for replication outputs

### Strict mode

Use `--strict` or `--strict-warnings` when publication quality or release-grade review matters.

## Next Steps

- [Creating Diagrams](./creating-diagrams.md)
- [Editing Diagrams](./editing-diagrams.md)
- [Replicating Diagrams](./scientific-workflows.md)
- [Design System](./design-system.md)
- [Specification Format](./specification.md)
