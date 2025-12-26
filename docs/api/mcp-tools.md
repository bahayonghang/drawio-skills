# MCP Tools Reference

Complete reference for all available MCP tools.

## Available Tools

### start_session

Opens Draw.io desktop and establishes a session for real-time preview.

**Usage**: Automatically called when creating a new diagram

**Parameters**: None

**Example**:
> "Start a new diagram session"

---

### display_diagram

Creates a new diagram from XML markup.

**Parameters**:
- `xml` (string): Draw.io XML format diagram definition

**Example**:
> "Create a flowchart with start, process, and end nodes"

Claude will generate the appropriate XML and call this tool.

---

### get_diagram

Retrieves the current diagram XML.

**Parameters**: None

**Returns**: Complete XML representation of the current diagram

**Use Cases**:
- Save diagram to file
- Inspect diagram structure
- Modify specific elements

---

### edit_diagram

Modifies an existing diagram by cell ID.

**Parameters**:
- `cellId` (string): ID of the cell to modify
- `xml` (string): New XML content for the cell

**Example**:
> "Change the text of node J5 to 'New Label'"
> "Set the fill color of cell J3 to #FF6B6B"

---

### export_diagram

Saves the current diagram as a .drawio file.

**Parameters**:
- `filename` (string): Output file path

**Example**:
> "Export the diagram as ~/Documents/my-diagram.drawio"

## Tool Workflow

### Creating a Diagram

1. `start_session` - Initialize session
2. `display_diagram` - Render initial diagram
3. Browser preview opens automatically

### Editing a Diagram

1. `get_diagram` - Retrieve current state (optional)
2. `edit_diagram` - Make targeted changes
3. Preview updates in real-time

### Saving a Diagram

1. `export_diagram` - Save to file system
2. File saved in .drawio XML format

## Best Practices

### Tool Selection

- Use `display_diagram` for new diagrams
- Use `edit_diagram` for modifications
- Use `get_diagram` when you need to inspect structure

### Efficient Editing

- Make multiple changes in a single `edit_diagram` call when possible
- Batch edits by cell ID for better performance
- Use browser preview to verify changes before saving

### Error Handling

If a tool fails:
1. Check that Draw.io desktop is running
2. Verify MCP server is connected
3. Ensure cell IDs are valid

## Technical Details

### XML Format

Draw.io uses an XML-based format. See [XML Format Reference](./xml-format) for details.

### Cell IDs

Each element in a diagram has a unique cell ID (e.g., "J5", "J12").
IDs are generated automatically when creating diagrams.

### Session Management

Only one session can be active at a time.
Starting a new session will close any existing session.

## Next Steps

- Learn about [XML Format](./xml-format)
- Browse [Examples](../examples/)
