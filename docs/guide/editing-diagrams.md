# Editing Diagrams (`/drawio edit`)

Use `/drawio edit` for incremental changes, theme switches, restructures, or imports from existing `.drawio` files.

## Preferred Edit Modes

### Existing offline bundle

This is the preferred path when the skill created the original diagram.

- read `.spec.yaml`
- update the spec
- re-render `.drawio`
- refresh `.arch.json`

### Existing `.drawio` file without sidecars

Import first:

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars
```

Then edit the generated spec and re-render.

### Live browser session

Use this only when optional MCP is already configured and the user explicitly wants live refinement.

Critical rule:

- call `get_diagram` before `edit_diagram`

## Common Edit Operations

### Rename labels

```text
/drawio edit rename User Service to Auth Service
```

### Add elements

```text
/drawio edit add a Redis Cache node between API Gateway and User Service, then connect it with data-flow arrows
```

### Change semantic types

```text
/drawio edit change the Event Store node from service to database
```

### Switch theme

```text
/drawio edit switch the diagram to high-contrast for accessibility review
```

### Restructure modules

```text
/drawio edit restructure this into input, processing, and output modules using academic theme
```

Major structural edits should pause for confirmation after the logic draft when semantics may change.

## Theme and Style Rules

- new nodes inherit the current theme
- new edges inherit the current connector style family
- type changes update shape semantics
- theme switches re-apply theme-token styling
- explicit color overrides stay explicit

## Offline Edit Commands

Re-render a `.drawio` bundle:

```bash
node skills/drawio/scripts/cli.js my-diagram.spec.yaml my-diagram.drawio --validate --write-sidecars
```

Re-render a strict SVG review artifact:

```bash
node skills/drawio/scripts/cli.js my-diagram.spec.yaml my-diagram.svg --validate --write-sidecars --strict-warnings
```

## Live MCP Edit Flow

Use the live route only when needed:

1. `start_session`
2. `create_new_diagram` or load the current diagram
3. `get_diagram`
4. `edit_diagram`
5. `export_diagram`

This route is optional. The offline sidecar path remains the default editing workflow.

## Troubleshooting

### Styles look inconsistent after edits

- check whether explicit style overrides were added
- re-apply the theme if you want token-based consistency

### Labels or IDs no longer match

- inspect the current `.spec.yaml`
- if using live MCP, fetch the latest XML with `get_diagram`

### Edit scope is too large

- convert it into a restructure request
- confirm the new logic graph before rendering

## Next Steps

- [Workflows](./workflows.md)
- [Replicating Diagrams](./scientific-workflows.md)
- [Export & Save](./export.md)
- [Optional MCP Tools](/api/mcp-tools.md)
