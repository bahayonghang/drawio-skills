# Draw.io Aesthetic & Professional Design Guide

> ⚠️ **DEPRECATED**: This file is deprecated. Please use the new **Design System** documentation instead:
> - [Design System Overview](design-system/README.md)
> - [Design Tokens](design-system/tokens.md) - Color palettes, spacing, typography
> - [Themes](design-system/themes.md) - 4 built-in themes for different use cases
> - [Shapes](design-system/shapes.md) - Semantic shape vocabulary
> - [Connectors](design-system/connectors.md) - Typed connector system
>
> The new design system implements the best practices from this guide in a structured, theme-aware manner.

---

*Legacy content preserved for reference:*

This guide provides best practices for creating visually appealing and professional diagrams in Draw.io, with a focus on network architectures and flowcharts.

## 1. Aesthetic Optimization Strategies

### 1.1 Layout & Structure
*   **Grid System**: Always enable the grid (View > Grid). A 10pt grid is standard. Snap to grid ensures alignment.
*   **Alignment**: Use `Arrange > Align` to perfectly align shapes. Do not eyeball it.
*   **Distribution**: Use `Arrange > Distribute` to space elements evenly.
*   **Whitespace**: Leave ample breathing room around clusters of nodes. Avoid "wall of text" or "spaghetti cables".
*   **Hierarchy**: Flow should generally go Top-to-Bottom or Left-to-Right.

### 1.2 Color & Visuals
*   **Color Palette**: Stick to a 3-4 color palette.
    *   **Primary**: Brand or main structural elements (e.g., #2D72D9 Blue).
    *   **Secondary**: Supporting elements (e.g., #F0F4F8 Light Blue).
    *   **Accent**: Highlights or warnings (e.g., #E05D44 Red).
    *   **Neutral**: Backgrounds and containers (e.g., #FAFAFA Grey).
*   **Consistency**:
    *   Same stroke width for all similar hierarchy items (e.g., 2pt for main, 1pt for details).
    *   Same font family (Helvetica/Arial/Roboto).
    *   Same corner rounding (e.g., 5px or 0px).

### 1.3 Lines & Connectors
*   **Style**:
    *   **Orthogonal (Sharp)**: Best for technical/network diagrams. Clean and organized.
    *   **Curved**: Best for mind maps or organic flows.
    *   **Rounded**: A softer alternative to orthogonal.
*   **Jumps**: Enable "Line Jumps" (gap) when lines cross to avoid ambiguity.
*   **Anchors**: Use "Floating" anchors (drag connection to center of shape) so lines adjust automatically when moving shapes.

### 1.4 Icons & Graphics
*   **Vector Icons**: Use SVG icons (built-in AWS/Azure/GCP/Cisco libraries) for sharpness at any zoom.
*   **Custom Libraries**: Import consistent icon sets. Avoid mixing "Sketchy" icons with "Flat" icons.

## 2. Advanced Features

### 2.1 Layers (View > Layers)
Organize complex diagrams into layers:
1.  **Background**: Watermarks, zones, containers.
2.  **Infrastructure**: Physical cabling, servers.
3.  **Logical**: Vlans, Subnets, Software flows.
4.  **Annotations**: Labels, notes, legends (can be toggled off for clean export).

### 2.2 Containers & Grouping
*   **Containers**: Use container shapes (drag from library) to group related items (e.g., "VPC", "Subnet").
*   **Collapsible**: Make containers collapsible to hide complexity.

### 2.3 Data Binding & Metadata
*   **Edit Data**: Right-click shape > `Edit Data` to add key-value pairs (e.g., IP Address, OS Version).
*   **Placeholders**: Use `%property_name%` in labels to display this data dynamically.

## 3. Workflow Integration
*   **Git Integration**: Save files as `.drawio.png` or `.drawio.svg`. These are valid image files that *also* contain the editable XML data.
*   **Embed**: Embed these images in Markdown/READMEs. They render as images but can be opened in Draw.io to edit.

## 4. Checklist for Professional Diagrams
- [ ] Is the grid enabled and aligned?
- [ ] Are fonts consistent (size/family)?
- [ ] Is the color palette limited and semantic?
- [ ] Are connectors orthogonal and non-overlapping?
- [ ] Is there a clear legend for symbols/colors?
- [ ] Are layers used for complexity management?
