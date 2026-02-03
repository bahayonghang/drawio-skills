# Workflow: /drawio edit

Edit existing diagrams with natural language modifications while preserving Design System consistency.

## Trigger

- **Command**: `/drawio edit ...`
- **Keywords**: "edit", "modify", "update", "change", "编辑", "修改"

## Procedure

```
Step 1: Identify Target
├── Option A: Current session diagram
│   └── Continue with active session
├── Option B: Load from file
│   └── User provides .drawio file path
└── Option C: Load from XML
    └── User provides XML content

Step 2: Understand Current State
├── Call MCP: get_diagram (if needed)
├── Parse XML structure
├── Detect current theme (if any)
└── Identify cell IDs for modification

Step 3: Parse Edit Instructions
├── Add operations (new nodes/edges)
├── Modify operations (change labels/styles)
├── Delete operations (remove elements)
├── Layout operations (rearrange)
└── Theme operations (switch theme)

Step 4: Apply Design System
├── Preserve existing theme unless switching
├── New nodes use semantic types
├── New edges use typed connectors
└── Maintain 8px grid alignment

Step 5: Apply Changes
├── Batch operations for efficiency
├── Call MCP: edit_diagram with operations
└── Browser updates in real-time

Step 6: Verify and Iterate
├── User reviews changes
└── Additional modifications as needed
```

## Design System Preservation

### Theme Consistency

When editing, the design system is preserved:

| Edit Type | Theme Behavior |
|-----------|----------------|
| Add node | Uses current theme's node style |
| Add edge | Uses current theme's connector style |
| Modify style | Suggests theme-compatible colors |
| Switch theme | Re-applies all styles from new theme |

### Theme Switching

To change the entire diagram's theme:

```
/drawio edit
Switch to academic theme for paper submission
```

```
/drawio edit with dark theme
Convert to presentation mode
```

### Semantic Type Changes

Change a node's semantic type to update its shape:

```
/drawio edit
Change "User Service" from service to database type
```

## Input Types

### Modify Labels

```
/drawio edit
Change "User Service" to "Auth Service"
Update the database label to include "PostgreSQL"
```

### Modify Styles (Theme-Aware)

```
/drawio edit
Make the API Gateway node use the accent color
Change all service nodes to database type
Use data flow style for async connections
```

### Add Elements (With Semantic Types)

```
/drawio edit
Add a new "Cache" node (type: service) between API and Database
Add a data flow arrow from Order Service to Notification Service
```

### Delete Elements

```
/drawio edit
Remove the legacy system node
Delete the connection between A and B
```

### Layout Changes (8px Grid)

```
/drawio edit
Move the database to the bottom (grid-aligned)
Align all services horizontally with 32px spacing
Increase spacing between modules
```

### Theme Switch

```
/drawio edit
Switch to dark theme for presentation
Convert to academic theme for paper
Apply tech-blue theme
```

## Edit Operation Types

| Operation | MCP Action | Design System Note |
|-----------|------------|-------------------|
| Update label | `edit_diagram` type: update | Preserves style |
| Update style | `edit_diagram` type: update | Use theme tokens |
| Change type | `edit_diagram` type: update | Updates shape |
| Add node | `edit_diagram` type: add | Apply semantic type |
| Add edge | `edit_diagram` type: add | Apply connector type |
| Delete | `edit_diagram` type: delete | N/A |
| Move | `edit_diagram` type: update | Snap to 8px grid |
| Switch theme | Regenerate styles | Re-apply all tokens |

## Semantic Type Operations

### Change Node Type

```
/drawio edit
Change "API" node from service to user type
→ Shape changes from rounded rect to circle
→ Colors updated to match type
```

### Change Connector Type

```
/drawio edit
Change the connection from API to DB to data flow
→ Line becomes dashed
→ Arrow style updates
```

## Batch Operations

For efficiency, batch multiple changes:

```
/drawio edit
1. Change "Service A" to "User Service"
2. Change its type to database
3. Add a new "Cache" node (service type)
4. Connect Cache to Database with data flow
5. Apply academic theme
```

Claude will combine these into efficient `edit_diagram` calls.

## Finding Elements

Reference elements by:

- **Label**: "the node labeled 'API Gateway'"
- **Position**: "the leftmost node"
- **Type**: "all database nodes"
- **Module**: "nodes in the Data module"

## Structural Reorganization

For major changes, use specification format:

```
/drawio edit with restructure
Reorganize into 3 modules with academic theme:

meta:
  theme: academic
  layout: vertical

modules:
  - id: input
    label: Input Layer
  - id: process
    label: Processing
  - id: output
    label: Output Layer
```

## Examples

### Quick Label Update

```
/drawio edit
Rename "User Auth" to "Authentication Service"
```

### Theme-Aware Style Update

```
/drawio edit
Apply these changes:
- All service nodes: use primary color
- All database nodes: use secondary color
- All data flows: use dashed connector style
```

### Add Component with Design System

```
/drawio edit
Add a "Redis Cache" node:
- Type: service
- Position: between API Gateway and User Service
- Connect with data flow to both
```

### Theme Switch for Presentation

```
/drawio edit with dark theme
Convert this architecture diagram to dark mode for my presentation
```

### Academic Conversion

```
/drawio edit with academic theme
Convert to IEEE style:
- Grayscale colors
- Serif fonts
- High contrast for print
```

### Complex Restructure with New Theme

```
/drawio edit with restructure and nature theme

Simplify to 3 modules:
- Merge "Data Collection" and "Data Processing" into "Data Pipeline"
- Keep semantic types for all nodes
- Use horizontal layout
```

## Best Practices

1. **Preserve theme** - Don't mix styles from different themes
2. **Use semantic types** - Let design system choose shapes
3. **Reference clearly** - Use exact labels or positions
4. **Batch related changes** - More efficient than multiple calls
5. **Use grid alignment** - Maintain professional 8px grid layout
6. **Switch theme intentionally** - Theme switch re-styles everything

## Troubleshooting

### "Cell not found"
- Label may have changed
- Call `get_diagram` to see current state
- Use exact label text

### Style looks wrong after edit
- Verify theme is consistent
- Check if type was changed accidentally
- Re-apply theme if mixed styles

### New elements don't match existing
- Specify semantic type for new nodes
- Specify connector type for new edges
- Consider theme switch if inconsistent

### Grid alignment off
- Use layout operations to re-align
- Snap positions to 8px grid
- Increase spacing if crowded

## Related

- [MCP Tools Reference](../docs/mcp-tools.md)
- [Design System Overview](../docs/design-system/README.md)
- [Themes Reference](../docs/design-system/themes.md)
- [Semantic Shapes](../docs/design-system/shapes.md)
- [Connectors](../docs/design-system/connectors.md)
- [Specification Format](../docs/design-system/specification.md)
