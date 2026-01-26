# Themes

The Draw.io Design System provides 5 built-in themes optimized for different use cases. Custom themes can be created using the JSON theme format.

---

## Built-in Themes

### Tech Blue (Default)

Modern professional style for technical architecture diagrams.

**Best for**: Software architecture, system design, DevOps, cloud infrastructure

**Characteristics**:
- Blue primary color with green/purple accents
- Rounded corners (8px)
- Clean sans-serif typography
- Light background with colored nodes

```yaml
meta:
  theme: tech-blue
```

| Element | Color |
|---------|-------|
| Primary nodes | Blue (#2563EB) |
| Database nodes | Green (#059669) |
| Decision nodes | Amber (#D97706) |
| Connectors | Dark gray (#1E293B) |

---

### Academic Color (Recommended for Academic)

Colorful academic style with semantic colors, optimized for digital viewing and color printing.

**Best for**: Research papers, academic publications, presentations, digital documents

**Characteristics**:
- Semantic colorful palette (blue, green, amber, purple)
- No rounded corners (sharp edges)
- Serif typography (Times New Roman)
- High readability with visual distinction

```yaml
meta:
  theme: academic-color
```

| Element | Fill | Stroke |
|---------|------|--------|
| service | 💙 `#DBEAFE` | `#2563EB` |
| database | 💚 `#D1FAE5` | `#059669` |
| decision | 🟡 `#FEF3C7` | `#D97706` |
| queue | 💜 `#EDE9FE` | `#7C3AED` |
| user | 🩵 `#E0F2FE` | `#0284C7` |

> **Recommended**: Use this theme for academic diagrams unless grayscale printing is required.

---

### Academic (Grayscale)

High-contrast black/white/gray for IEEE-style publications, optimized for grayscale print.

**Best for**: Grayscale printing, strict IEEE format requirements

**Characteristics**:
- Pure black/white/gray palette
- No rounded corners (sharp edges)
- Serif typography (Times New Roman)
- Maximum contrast for readability

```yaml
meta:
  theme: academic
```

| Element | Color |
|---------|-------|
| All nodes | White fill, black stroke |
| Labels | Black (#1E1E1E) |
| Connectors | Black (#1E1E1E) |

> **Print-safe**: This theme remains readable when printed in grayscale.

---

### Nature

Green-focused palette for lifecycle, sustainability, and environmental diagrams.

**Best for**: Environmental systems, lifecycle diagrams, sustainability reports, biology

**Characteristics**:
- Green/teal primary colors
- Natural, organic feel
- Light green tints
- Rounded corners

```yaml
meta:
  theme: nature
```

| Element | Color |
|---------|-------|
| Primary nodes | Green (#059669) |
| Database nodes | Lime (#84CC16) |
| Decision nodes | Yellow (#CA8A04) |
| Background | White with green tint |

---

### Dark Mode

Dark background with light text for presentations and terminal-style diagrams.

**Best for**: Presentations, slides, terminal/console themes, night mode

**Characteristics**:
- Dark slate background (#0F172A)
- Light text and bright accent colors
- High contrast for projection
- Rounded corners

```yaml
meta:
  theme: dark
```

| Element | Color |
|---------|-------|
| Background | Dark slate (#0F172A) |
| Primary nodes | Blue (#60A5FA) |
| Database nodes | Emerald (#34D399) |
| Text | Light gray (#F1F5F9) |

---

## Theme Selection

### In Specification

```yaml
meta:
  theme: tech-blue  # or: academic, nature, dark
  layout: horizontal
```

### Per-Node Override

Individual nodes can override theme defaults:

```yaml
nodes:
  - id: critical
    label: Critical Service
    style:
      fillColor: "#FEE2E2"  # Override with error color
      strokeColor: "#DC2626"
```

---

## Custom Themes

Create custom themes by providing a JSON file following the theme schema.

### Minimal Custom Theme

```json
{
  "$schema": "./theme.schema.json",
  "name": "my-theme",
  "displayName": "My Custom Theme",
  "description": "Custom theme for my organization",
  "colors": {
    "primary": "#6366F1",
    "primaryLight": "#E0E7FF",
    "secondary": "#EC4899",
    "secondaryLight": "#FCE7F3",
    "accent": "#14B8A6",
    "accentLight": "#CCFBF1",
    "background": "#FFFFFF",
    "surface": "#F8FAFC",
    "surfaceAlt": "#F1F5F9",
    "text": "#1E293B",
    "textMuted": "#64748B",
    "textInverse": "#FFFFFF",
    "border": "#E2E8F0",
    "borderStrong": "#CBD5E1",
    "success": "#22C55E",
    "successLight": "#DCFCE7",
    "warning": "#F59E0B",
    "warningLight": "#FEF3C7",
    "error": "#EF4444",
    "errorLight": "#FEE2E2",
    "info": "#3B82F6",
    "infoLight": "#DBEAFE"
  },
  "spacing": {
    "unit": 8,
    "scale": {
      "xs": 4, "sm": 8, "md": 16, "lg": 24, "xl": 32,
      "2xl": 40, "3xl": 48, "4xl": 64, "5xl": 80
    }
  },
  "typography": {
    "fontFamily": {
      "primary": "Inter, sans-serif",
      "monospace": "Fira Code, monospace",
      "formula": "STIX Two Math, serif"
    },
    "fontSize": {
      "xs": 10, "sm": 11, "md": 13, "lg": 14, "xl": 16, "2xl": 20
    },
    "fontWeight": {
      "normal": 400, "medium": 500, "semibold": 600, "bold": 700
    }
  },
  "borderRadius": {
    "none": 0, "sm": 4, "md": 8, "lg": 12, "full": 9999
  },
  "shadows": {
    "none": "none",
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 6px rgba(0,0,0,0.07)",
    "lg": "0 10px 15px rgba(0,0,0,0.1)"
  },
  "node": {
    "default": {
      "fillColor": "#E0E7FF",
      "strokeColor": "#6366F1",
      "strokeWidth": 1.5,
      "fontColor": "#1E293B",
      "fontSize": 13,
      "fontFamily": "Inter, sans-serif",
      "rounded": 8
    }
  },
  "connector": {
    "primary": {
      "strokeColor": "#1E293B",
      "strokeWidth": 2,
      "dashed": false,
      "dashPattern": null,
      "endArrow": "block",
      "endFill": true
    }
  },
  "module": {
    "fillColor": "#F8FAFC",
    "strokeColor": "#E2E8F0",
    "strokeWidth": 1,
    "rounded": 12,
    "padding": 24,
    "labelFontSize": 14,
    "labelFontWeight": 600,
    "labelFontColor": "#1E293B"
  },
  "canvas": {
    "background": "#FFFFFF",
    "gridSize": 8,
    "gridColor": "#E2E8F0"
  }
}
```

### Using Custom Theme

Place the JSON file in `themes/` directory and reference by name:

```yaml
meta:
  theme: my-theme  # Loads themes/my-theme.json
```

---

## Theme File Structure

```
skills/drawio/themes/
├── theme.schema.json      # JSON Schema for validation
├── tech-blue.json         # Default theme
├── academic-color.json    # Academic colorful (recommended)
├── academic.json          # Academic grayscale
├── nature.json            # Green/environmental theme
├── dark.json              # Dark mode theme
└── [custom].json          # User custom themes
```

---

## Validation

Themes are validated against `theme.schema.json`. Required fields:

- `name`: Machine identifier (lowercase, hyphens)
- `displayName`: Human-readable name
- `colors`: Color token definitions
- `spacing`: Spacing system
- `typography`: Font definitions
- `borderRadius`: Corner radius tokens
- `node`: Node styling (at least `default`)
- `connector`: Connector styling (at least `primary`)
- `module`: Module/container styling
- `canvas`: Canvas settings

---

## Theme Switching

To switch themes on an existing diagram:

1. Update the `theme` field in specification
2. Re-render the diagram
3. All non-overridden styles will update to new theme

> **Note**: Explicitly defined colors in nodes/edges will NOT change when switching themes. Only theme-referenced values (`$primary`, `$text`, etc.) are affected.
