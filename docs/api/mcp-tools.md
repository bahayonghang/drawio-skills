# MCP Tools Reference

This document describes the available MCP tools provided by the Next AI Draw.io MCP server.

## start_session

Opens a browser window with real-time diagram preview.

### Description

This tool starts a new diagram editing session by:
1. Starting an embedded HTTP server (default port: 6002)
2. Opening the user's default browser with the draw.io editor
3. Establishing a connection between the MCP server and the browser

### Parameters

None

### Returns

- `sessionId`: Unique identifier for the session
- `url`: Browser URL with the draw.io editor
- `port`: Port number of the embedded HTTP server

### Example

```
Tool: start_session
Result: Session started at http://localhost:6002?mcp=abc123
```

### Notes

- Must be called before any diagram operations
- Only one session can be active at a time
- The browser window will show the draw.io editor with real-time updates

---

## create_new_diagram

Create a new diagram from XML.

### Description

Creates a new diagram by sending draw.io XML to the browser. The diagram will appear immediately in the browser window.

### Parameters

- `xml` (required): Draw.io diagram XML string

### Returns

- `success`: Boolean indicating if the diagram was created
- `message`: Status message

### Example

```
Tool: create_new_diagram
Parameters:
  xml: <mxGraphModel>...</mxGraphModel>
Result: Diagram created successfully
```

### Notes

- Requires an active session (call `start_session` first)
- The XML must be valid draw.io format
- The browser will update immediately with the new diagram

---

## edit_diagram

Edit diagram by ID-based operations.

### Description

Modifies an existing diagram by performing operations on specific cells (nodes, edges, etc.) identified by their IDs.

### Parameters

- `operations` (required): Array of edit operations

Each operation has:
- `type`: Operation type (`update`, `add`, `delete`)
- `cellId`: ID of the cell to modify
- `properties`: Properties to update (for `update` and `add` operations)

### Returns

- `success`: Boolean indicating if the edit was successful
- `message`: Status message

### Example

```
Tool: edit_diagram
Parameters:
  operations: [
    {
      "type": "update",
      "cellId": "2",
      "properties": {
        "value": "Updated Label",
        "style": "rounded=1;fillColor=#dae8fc"
      }
    }
  ]
Result: Diagram updated successfully
```

### Notes

- Requires an active session with an existing diagram
- Cell IDs can be obtained from `get_diagram`
- Multiple operations can be performed in a single call

---

## get_diagram

Get the current diagram XML.

### Description

Retrieves the current diagram XML from the browser. Useful for:
- Inspecting the diagram structure
- Getting cell IDs for editing
- Saving the current state

### Parameters

None

### Returns

- `xml`: Current diagram XML string

### Example

```
Tool: get_diagram
Result: <mxGraphModel>...</mxGraphModel>
```

### Notes

- Requires an active session with an existing diagram
- Returns the complete diagram XML including all cells and styles

---

## export_diagram

Save diagram to a `.drawio` file.

### Description

Exports the current diagram to a `.drawio` file on the local filesystem.

### Parameters

- `filename` (required): Output filename (with or without `.drawio` extension)
- `path` (optional): Directory path (defaults to current directory)

### Returns

- `success`: Boolean indicating if the export was successful
- `filepath`: Full path to the exported file
- `message`: Status message

### Example

```
Tool: export_diagram
Parameters:
  filename: "my-architecture.drawio"
  path: "./diagrams"
Result: Diagram exported to ./diagrams/my-architecture.drawio
```

### Notes

- Requires an active session with an existing diagram
- The `.drawio` extension is added automatically if not provided
- The directory must exist or be creatable

---

## Workflow Example

Here's a typical workflow using these tools:

```
1. start_session
   → Opens browser with draw.io editor

2. create_new_diagram
   → Creates initial diagram from XML

3. get_diagram (optional)
   → Inspect current diagram structure

4. edit_diagram (optional, multiple times)
   → Make iterative changes to the diagram

5. export_diagram
   → Save the final diagram to a file
```

## Error Handling

All tools return error messages if something goes wrong:

- **"No active session"**: Call `start_session` first
- **"Invalid XML"**: The provided XML is not valid draw.io format
- **"Cell not found"**: The specified cell ID doesn't exist in the diagram
- **"Port in use"**: The server port is already in use (will auto-increment)

## Tips

### Getting Cell IDs

To edit specific elements, you need their cell IDs. Use `get_diagram` to get the XML, then parse it to find cell IDs:

```xml
<mxCell id="2" value="My Node" style="rounded=1" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
</mxCell>
```

The `id="2"` is the cell ID you can use in `edit_diagram`.

### Batch Operations

You can perform multiple edits in a single `edit_diagram` call for better performance:

```json
{
  "operations": [
    {"type": "update", "cellId": "2", "properties": {"value": "New Label"}},
    {"type": "update", "cellId": "3", "properties": {"style": "fillColor=#f8cecc"}},
    {"type": "delete", "cellId": "4"}
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
