# Optional MCP Tools

These MCP tools support live browser editing. They are **not** the default runtime for Draw.io Skill 2.2.0.

Use them only when:

- next-ai MCP is configured
- the user wants real-time browser refinement

The default workflow is still offline-first with `.drawio` + sidecars.

## `start_session`

Open a new browser editing session.

### Purpose

- start the embedded HTTP server
- open draw.io in the browser
- create a live session bridge for later tool calls

### Parameters

None.

### Notes

- required before any other MCP diagram calls
- intended only for live refinement workflows

## `create_new_diagram`

Create a new diagram from full `mxGraphModel` XML.

### Parameters

| Name | Required | Description |
|------|----------|-------------|
| `xml` | Yes | Full `mxGraphModel` XML string |

### Notes

- use for fresh diagrams or full replacement
- IDs `0` and `1` remain reserved root cells

## `get_diagram`

Fetch the latest diagram XML from the browser.

### Why it matters

Always call `get_diagram` before `edit_diagram` so you do not overwrite manual edits made in the browser.

## `edit_diagram`

Update, add, or delete cells by ID.

### Parameters

| Name | Required | Description |
|------|----------|-------------|
| `operations` | Yes | Array of `update`, `add`, or `delete` operations |

### Operation shape

| Field | Required | Description |
|-------|----------|-------------|
| `operation` | Yes | `update`, `add`, or `delete` |
| `cell_id` | Yes | Existing ID for update/delete, new ID for add |
| `new_xml` | For add/update | Full `<mxCell>` element including `<mxGeometry>` |

## `export_diagram`

Export the current live diagram to disk.

### Parameters

| Name | Required | Description |
|------|----------|-------------|
| `path` | Yes | Output file path |
| `format` | No | `drawio`, `png`, or `svg`; inferred from extension when omitted |

## Live Workflow

1. `start_session`
2. `create_new_diagram`
3. `get_diagram`
4. `edit_diagram`
5. `export_diagram`

## When Not to Use MCP

Prefer the local CLI and sidecar bundle when:

- you are creating a diagram from scratch without needing a browser
- you want version-controlled edits
- you need repeatable export commands
- you are working in CI or scripted environments

## Related

- [Getting Started](../guide/getting-started.md)
- [Editing Diagrams](../guide/editing-diagrams.md)
- [Export & Save](../guide/export.md)
