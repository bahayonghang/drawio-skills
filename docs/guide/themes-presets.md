# Themes And Style Presets

Themes provide coherent tokens for canvas, typography, nodes, modules, and typed connectors. Style presets capture reusable overrides. Prefer both over hand-written raw XML styles.

## Bundled Themes

| Theme | Best use |
|---|---|
| `tech-blue` | general light technical diagrams |
| `notion-clean` | minimal grayscale documentation, ER, sequence, and tables |
| `blueprint` | formal architecture, UML, networks, and data flow |
| `arch-dark` | role-coded cloud and service architecture |
| `dark-terminal` | developer architecture and agent systems |
| `dark-luxury` | editorial or keynote diagrams |
| `nature` | lifecycle and organic subject matter |
| `dark` | general dark presentation assets |
| `high-contrast` | maximum legibility and accessibility |
| `academic` | grayscale-safe publication figures |
| `academic-color` | publication figures where color is acceptable |

Academic requests still route through the Academic Overlay; selecting an academic theme alone does not apply publication preflight or quality gates.

## Apply A Theme

```yaml
meta:
  theme: blueprint
```

or override it at the command line:

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --theme blueprint --validate
```

Theme tokens change automatically. Explicit node or edge colors remain explicit and do not follow later theme changes.

## Style Presets

Use built-in presets under `skills/drawio/styles/built-in/` for reusable style decisions. User presets should be copied to a user-owned location before modification; do not edit bundled presets in place.

Raw Draw.io style strings are an exception for small XML patches or exact mxGraph handoff. They are not the primary authoring contract.

## Selection Rules

- Use one theme per diagram unless replicating a source with explicit styling.
- Keep explicit palettes restrained and meaningful.
- Do not rely on color alone for semantics; preserve shape, labels, and dash patterns.
- Use `academic` or `academic-color` through the overlay for publication work.
- Validate contrast and inspect the exported artifact after switching themes.

## Related

- [Design System](./design-system.md)
- [Architecture Diagrams](./architecture-diagrams.md)
- [Academic Overlay](./academic-overlay.md)
