# Workflows Overview

Draw.io Skill provides 3 clear workflows integrated with the Design System 2.0.

## Quick Reference

| Command | Description | Theme | Semantic Types |
|---------|-------------|-------|----------------|
| `/drawio create` | Create from natural language | ✅ Selectable | ✅ Auto-detect |
| `/drawio replicate` | Replicate existing images | ✅ Domain-based | ✅ Mapped |
| `/drawio edit` | Modify existing diagrams | ✅ Switchable | ✅ Preserved |

## `/drawio create` - Create from Scratch

Create diagrams from natural language with full design system support.

### Basic Usage

```
/drawio create
A login flowchart with validation and error handling
```

### With Theme Selection

```
/drawio create with tech-blue theme
A microservices architecture:
- API Gateway connects to User Service and Order Service
- Both services use PostgreSQL database
- Redis Cache for session storage
```

### With Explicit Types

```
/drawio create with academic theme
Neural network architecture:
- Input Layer (service)
- Hidden Layer 1 (service)
- Hidden Layer 2 (service)
- Output Layer (terminal)
- Loss Function: $$L = -\sum y \log(\hat{y})$$ (formula)
```

### Design System Features

| Feature | Behavior |
|---------|----------|
| Theme | Select with "with [theme] theme" or defaults to `tech-blue` |
| Shapes | Auto-detected from labels (database, queue, etc.) |
| Connectors | Inferred from context (data, optional, dependency) |
| Grid | All positions snapped to 8px grid |
| Layout | Horizontal by default, vertical with "vertical layout" |

**Complexity Guardrails:**
- Warning at >20 nodes (suggest splitting)
- Error at >30 nodes (require confirmation)
- Info for labels >14 characters

→ [Full documentation](./creating-diagrams.md)

## `/drawio replicate` - Replicate Existing

Recreate diagrams from images using structured extraction with theme mapping.

### Basic Usage

```
/drawio replicate
[Upload image]
```

### With Theme Override

```
/drawio replicate with academic theme
[Upload architecture screenshot]
```

### Domain-Based Theme Selection

| Domain | Recommended Theme |
|--------|-------------------|
| 软件架构 (Software) | `tech-blue` |
| 商业流程 (Business) | `tech-blue` |
| 科研流程 (Research) | `academic` |
| 工业流程 (Industrial) | `nature` |
| 演示文稿 (Presentation) | `dark` |

### Extraction Process

1. **Analyze** - Extract visual elements from image
2. **Map** - Convert to semantic shapes and typed connectors
3. **Apply Theme** - Style with selected or inferred theme
4. **Generate** - Create YAML spec then draw.io XML
5. **Preview** - Real-time display in browser

### Semantic Mapping

| Visual Element | Semantic Type |
|----------------|---------------|
| Rounded rectangle | `service` |
| Cylinder/Database icon | `database` |
| Diamond | `decision` |
| Circle | `terminal` or `user` |
| Parallelogram | `queue` |
| Document shape | `document` |

→ [Full documentation](./scientific-workflows.md)

## `/drawio edit` - Modify Diagram

Edit existing diagrams while preserving design system consistency.

### Basic Usage

```
/drawio edit
Change "User Service" to "Auth Service"
```

### Theme Switching

```
/drawio edit with dark theme
Convert to presentation mode
```

### Style Operations

```
/drawio edit
- Change API Gateway to use accent color
- Convert all service nodes to database type
- Use data flow style for async connections
```

### Add Elements

```
/drawio edit
Add a "Redis Cache" node (service type) between API and Database
Connect with data flow arrow
```

### Structural Changes

```
/drawio edit with restructure and academic theme
Reorganize into 3 modules:
- Input Layer
- Processing
- Output Layer
```

### Preservation Rules

| Edit Type | Theme Behavior |
|-----------|----------------|
| Add node | Uses current theme's style |
| Add edge | Uses current theme's connector |
| Modify style | Suggests theme-compatible colors |
| Switch theme | Re-applies all styles |
| Move node | Snaps to 8px grid |

→ [Full documentation](./editing-diagrams.md)

## Design System Integration

All three workflows share the same design system:

### 4 Built-in Themes

```
tech-blue   # Default, professional blue
academic    # IEEE-ready grayscale
nature      # Green environmental
dark        # Presentation mode
```

### 8 Semantic Node Types

```yaml
service    # Rounded rectangle (default)
database   # Cylinder shape
decision   # Diamond
terminal   # Stadium shape
queue      # Parallelogram
user       # Ellipse
document   # Document shape
formula    # White box with math support
```

### 5 Connector Types

```yaml
primary      # Solid 2px, block arrow
data         # Dashed, for data flow
optional     # Thin dashed, optional paths
dependency   # Diamond arrow end
bidirectional # No arrows
```

### 8px Grid System

All positions are snapped to 8px increments:
- Node spacing: 32px (4 units)
- Module padding: 24px (3 units)
- Minimum margin: 8px (1 unit)

## YAML Specification Format

The new specification format used internally:

```yaml
meta:
  theme: tech-blue
  layout: horizontal

modules:
  - id: backend
    label: Backend Services

nodes:
  - id: api
    label: API Gateway
    type: service
    module: backend
  - id: db
    label: PostgreSQL
    type: database

edges:
  - from: api
    to: db
    type: data
    label: Query
```

→ [Specification Format](./specification.md)

## Next Steps

- [Creating Diagrams](./creating-diagrams.md) - Full `/drawio create` guide
- [Scientific Workflows](./scientific-workflows.md) - Full `/drawio replicate` guide
- [Editing Diagrams](./editing-diagrams.md) - Full `/drawio edit` guide
- [Design System](./design-system.md) - Themes, shapes, connectors
- [Specification Format](./specification.md) - YAML spec reference
- [Examples](/examples/) - Real diagram examples
