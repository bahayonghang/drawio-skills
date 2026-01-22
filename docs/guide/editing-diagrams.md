# Editing Diagrams

Learn how to modify existing diagrams using natural language and ID-based operations.

## Overview

Once you've created a diagram, you can edit it in two ways:

1. **Natural Language**: Describe the changes you want
2. **ID-based Operations**: Directly modify specific elements using their cell IDs

## Natural Language Editing

The simplest way to edit a diagram is to describe what you want to change.

### Example: Modify a Node

```
"Change the label of the 'Process' node to 'Validate Input'"
```

### Example: Add a New Element

```
"Add a new decision node after the validation step asking 'Is data valid?'"
```

### Example: Change Colors

```
"Make all error paths red and success paths green"
```

### Example: Rearrange Layout

```
"Move the database node to the right side of the diagram"
```

## Understanding Cell IDs

Every element in a draw.io diagram has a unique cell ID. To perform precise edits, you need to know these IDs.

### Getting Cell IDs

First, get the current diagram XML:

```
"Show me the current diagram XML"
```

Claude will call `get_diagram` and show you the XML structure. Look for `id` attributes:

```xml
<mxCell id="2" value="My Node" style="rounded=1" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
</mxCell>
```

In this example, the cell ID is `"2"`.

::: tip
Cell IDs "0" and "1" are reserved for the root and default layer. Your diagram elements start from ID "2".
:::

## ID-based Operations

### Update Operation

Modify an existing element's properties:

```
"Update cell 2: change the label to 'New Label' and make it blue"
```

This translates to:

```json
{
  "type": "update",
  "cellId": "2",
  "properties": {
    "value": "New Label",
    "style": "rounded=1;fillColor=#dae8fc;strokeColor=#6c8ebf"
  }
}
```

### Add Operation

Add a new element to the diagram:

```
"Add a new rectangle at position (200, 200) with label 'New Node'"
```

### Delete Operation

Remove an element from the diagram:

```
"Delete cell 5"
```

## Batch Operations

You can perform multiple edits in a single operation for better efficiency:

```
"Update cells 2, 3, and 4: make them all blue with rounded corners"
```

This performs three updates in one call:

```json
{
  "operations": [
    {"type": "update", "cellId": "2", "properties": {...}},
    {"type": "update", "cellId": "3", "properties": {...}},
    {"type": "update", "cellId": "4", "properties": {...}}
  ]
}
```

## Common Editing Tasks

### Change Node Labels

```
"Change the label of cell 3 to 'Authentication Service'"
```

### Change Colors

```
"Make cell 2 green (success state)"
```

Common colors:
- Green: `#d5e8d4` (success)
- Blue: `#dae8fc` (process)
- Yellow: `#fff2cc` (warning)
- Red: `#f8cecc` (error)

### Change Shapes

```
"Change cell 4 to a diamond shape (decision node)"
```

Common shapes:
- Rectangle: `shape=rectangle`
- Ellipse: `shape=ellipse`
- Diamond: `shape=rhombus`
- Cylinder: `shape=cylinder`

### Modify Connections

```
"Change the arrow from cell 2 to cell 3 to be dashed"
```

### Add Annotations

```
"Add a text note next to cell 5 saying 'This is the main process'"
```

## Style Properties

When editing, you can modify various style properties:

### Shape Properties

- `fillColor`: Background color (hex)
- `strokeColor`: Border color (hex)
- `strokeWidth`: Border width (number)
- `rounded`: Rounded corners (0 or 1)
- `dashed`: Dashed border (0 or 1)

### Text Properties

- `fontColor`: Text color (hex)
- `fontSize`: Font size (number)
- `fontStyle`: Font style (0=normal, 1=bold, 2=italic, 4=underline)
- `align`: Horizontal alignment (left, center, right)
- `verticalAlign`: Vertical alignment (top, middle, bottom)

### Edge Properties

- `edgeStyle`: Edge routing (orthogonalEdgeStyle, elbowEdgeStyle)
- `curved`: Curved edge (0 or 1)
- `startArrow`: Start arrow type (classic, block, diamond)
- `endArrow`: End arrow type (classic, block, diamond)

## Example: Complete Edit Workflow

1. **View current diagram**:
   ```
   "Show me the current diagram structure"
   ```

2. **Identify elements to edit**:
   ```
   "What are the cell IDs in this diagram?"
   ```

3. **Make changes**:
   ```
   "Update cell 2: change label to 'API Gateway' and make it blue"
   "Update cell 3: change label to 'Lambda Function' and make it orange"
   "Add a connection from cell 2 to cell 3 with label 'invokes'"
   ```

4. **Verify changes**:
   ```
   "Show me the updated diagram"
   ```

## Tips for Effective Editing

### Use Natural Language First

Start with natural language descriptions. Claude will handle the cell IDs for you:

```
"Make all database nodes green"
```

### Be Specific

Instead of:
```
"Change the color"
```

Use:
```
"Change cell 3's background color to light blue (#dae8fc)"
```

### Incremental Changes

Make small, incremental changes rather than trying to do everything at once:

```
1. "Change the layout to horizontal"
2. "Add spacing between nodes"
3. "Align all nodes to the center"
```

### Verify After Each Change

After making changes, verify the result:

```
"Show me the current diagram"
```

## Next Steps

- [Export & Save](./export.md) - Learn how to save your diagrams
- [XML Format](/api/xml-format.md) - Understand the XML structure
- [MCP Tools](/api/mcp-tools.md) - Learn about the edit_diagram tool
