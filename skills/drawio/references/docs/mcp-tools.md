# MCP Tools Reference

This document describes the available MCP tools provided by the draw.io MCP server for real-time diagram editing in the browser.

> These tools are **optional live-editing enhancers**, not the default runtime. Use them only when next-ai MCP is configured and the user wants real-time browser refinement. The core skill should still work offline with `.drawio` + sidecars.

## start_session

Start a new diagram session and open the browser for real-time preview.

### Description

This tool starts a new diagram editing session by:

1. Starting an embedded HTTP server
2. Opening the user's default browser with the draw.io editor
3. Establishing a connection between the MCP server and the browser

### Parameters

None

### Returns

Confirmation that the session was started with the browser URL.

### Example

```
Tool: start_session
Result: Session started at http://localhost:...
```

### Notes

- Must be called before any diagram operations
- Only one session can be active at a time
- The browser window will show the draw.io editor with real-time updates

---

## create_new_diagram

Create a NEW diagram from mxGraphModel XML.

### Description

Creates a new diagram by sending complete draw.io XML to the browser. Use this when creating a diagram from scratch or replacing the current diagram entirely.

### Parameters

- `xml` (required): The complete mxGraphModel XML string

### XML Format

```xml
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Shape" style="rounded=1;" vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>
```

### Notes

- Requires an active session (call `start_session` first)
- The XML must be valid mxGraphModel format
- IDs `0` and `1` are reserved for root cells
- Use unique IDs starting from `2` for your shapes
- Set `parent="1"` for top-level shapes
- The browser updates immediately with the new diagram

---

## get_diagram

Get the current diagram XML from the browser.

### Description

Fetches the latest diagram XML from the browser, **including any manual edits the user may have made** in the draw.io editor.

### Parameters

None

### Returns

The current diagram XML as an mxGraphModel string.

### Notes

- Requires an active session with an existing diagram
- Returns the complete diagram XML including all cells and styles
- **IMPORTANT**: Always call `get_diagram` BEFORE `edit_diagram` to fetch the latest browser state. Skipping this step may cause the user's manual changes to be lost.

---

## edit_diagram

Edit the current diagram by ID-based operations (update/add/delete cells).

### Description

Modifies an existing diagram by performing operations on specific cells identified by their IDs. Each operation requires a complete mxCell XML element for `update` and `add`.

> **Prerequisite**: You MUST call `get_diagram` BEFORE this tool to fetch the latest state from the browser, including any manual user edits.

### Parameters

- `operations` (required): Array of edit operations

Each operation has:

- `operation`: Operation type — `update`, `add`, or `delete`
- `cell_id`: ID of the target cell (existing ID for `update`/`delete`, new unique ID for `add`)
- `new_xml`: Complete mxCell XML element (required for `update` and `add`, not needed for `delete`)

### Operations

| Operation | Description | Required Fields |
|-----------|-------------|-----------------|
| `update` | Replace an existing cell by its ID | `operation`, `cell_id`, `new_xml` |
| `add` | Add a new cell with a new unique ID | `operation`, `cell_id`, `new_xml` |
| `delete` | Remove a cell by its ID | `operation`, `cell_id` |

### Example — Update a cell

```json
{
  "operations": [
    {
      "operation": "update",
      "cell_id": "3",
      "new_xml": "<mxCell id=\"3\" value=\"New Label\" style=\"rounded=1;fillColor=#dae8fc;\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"100\" y=\"100\" width=\"120\" height=\"60\" as=\"geometry\"/></mxCell>"
    }
  ]
}
```

### Example — Add a new cell

```json
{
  "operations": [
    {
      "operation": "add",
      "cell_id": "rect-1",
      "new_xml": "<mxCell id=\"rect-1\" value=\"Hello\" style=\"rounded=0;\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"100\" y=\"100\" width=\"120\" height=\"60\" as=\"geometry\"/></mxCell>"
    }
  ]
}
```

### Example — Delete a cell

```json
{
  "operations": [
    {
      "operation": "delete",
      "cell_id": "rect-1"
    }
  ]
}
```

### Notes

- **Always call `get_diagram` first** to see current cell IDs and structure
- Cell IDs are found in the `id` attribute of `<mxCell>` elements
- For `update` and `add`, `new_xml` must be a complete `<mxCell>` element including `<mxGeometry>`
- Multiple operations can be performed in a single call

---

## export_diagram

Export the current diagram to a file.

### Description

Exports the current diagram to a file on the local filesystem. Supports `.drawio` (XML), `.png`, and `.svg` formats. The format is auto-detected from the file extension, or can be specified explicitly.

### Parameters

- `path` (required): File path to save the diagram (e.g., `./diagram.drawio`, `./diagram.png`, `./diagram.svg`)
- `format` (optional): Export format — `drawio`, `png`, or `svg`. If omitted, auto-detected from the file extension. Defaults to `drawio`.

### Example

```
Tool: export_diagram
Parameters:
  path: "./diagrams/my-architecture.drawio"
Result: Diagram exported to ./diagrams/my-architecture.drawio
```

### Example — SVG export

```
Tool: export_diagram
Parameters:
  path: "./figures/fig1.svg"
  format: svg
```

### Notes

- Requires an active session with an existing diagram
- Format is auto-detected from file extension when `format` is omitted
- For academic/paper figures, prefer `.svg` for vector quality

---

## Workflow Example

Here's a typical workflow using these tools:

```
1. start_session
   -> Opens browser with draw.io editor

2. create_new_diagram
   -> Creates initial diagram from mxGraphModel XML

3. get_diagram
   -> Fetch current state (always do this before editing!)

4. edit_diagram (optional, multiple times)
   -> Make iterative changes via operations

5. export_diagram
   -> Save the final diagram to .drawio, .png, or .svg
```

## Error Handling

All tools return error messages if something goes wrong:

- **"No active session"**: Call `start_session` first
- **"Invalid XML"**: The provided XML is not valid mxGraphModel format
- **"Cell not found"**: The specified `cell_id` doesn't exist in the diagram
- **"Port in use"**: The server port is already in use (will auto-increment)

## Tips

### Getting Cell IDs

To edit specific elements, first call `get_diagram` to retrieve the XML. Then find cell IDs in the `id` attributes:

```xml
<mxCell id="2" value="My Node" style="rounded=1" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
</mxCell>
```

The `id="2"` is the cell ID you use in `edit_diagram` operations.

### Batch Operations

Perform multiple edits in a single `edit_diagram` call for efficiency:

```json
{
  "operations": [
    {
      "operation": "update",
      "cell_id": "2",
      "new_xml": "<mxCell id=\"2\" value=\"New Label\" style=\"rounded=1;\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"100\" y=\"100\" width=\"120\" height=\"60\" as=\"geometry\"/></mxCell>"
    },
    {
      "operation": "update",
      "cell_id": "3",
      "new_xml": "<mxCell id=\"3\" value=\"Styled\" style=\"fillColor=#f8cecc;\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"250\" y=\"100\" width=\"120\" height=\"60\" as=\"geometry\"/></mxCell>"
    },
    {
      "operation": "delete",
      "cell_id": "4"
    }
  ]
}
```

### Diagram Styles

Draw.io uses a style string format for visual properties:

```
rounded=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontColor=#000000
```

Common style properties:

- `fillColor`: Background color (hex)
- `strokeColor`: Border color (hex)
- `fontColor`: Text color (hex)
- `rounded`: Rounded corners (0 or 1)
- `dashed`: Dashed border (0 or 1)
- `fontSize`: Font size (number)
- `fontStyle`: Font style (0=normal, 1=bold, 2=italic, 4=underline)
